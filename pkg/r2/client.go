package r2

import (
	"bytes"
	"context"
	"errors"
	"fmt"
	"io"
	"strings"
	"time"

	"github.com/aws/aws-sdk-go-v2/aws"
	"github.com/aws/aws-sdk-go-v2/credentials"
	"github.com/aws/aws-sdk-go-v2/service/s3"
	"github.com/aws/aws-sdk-go-v2/service/s3/types"
	"github.com/aws/smithy-go"
)

// Client is a thin S3-compatible wrapper for Cloudflare R2.
type Client struct {
	cfg     Config
	s3      *s3.Client
	presign *s3.PresignClient
}

// NewClient builds an R2 client. Call Config.Validate first when enabling storage.
func NewClient(cfg Config) (*Client, error) {
	if err := cfg.Validate(); err != nil {
		return nil, err
	}
	if !cfg.Enabled {
		return &Client{cfg: cfg}, nil
	}

	s3Client := s3.New(s3.Options{
		Region:       "auto",
		Credentials:  credentials.NewStaticCredentialsProvider(cfg.AccessKeyID, cfg.SecretAccessKey, ""),
		BaseEndpoint: aws.String(cfg.Endpoint),
		UsePathStyle: true,
		// Cloudflare R2 rejects some default checksum headers from newer SDKs.
		RequestChecksumCalculation: aws.RequestChecksumCalculationWhenRequired,
		ResponseChecksumValidation: aws.ResponseChecksumValidationWhenRequired,
	})

	return &Client{
		cfg:     cfg,
		s3:      s3Client,
		presign: s3.NewPresignClient(s3Client),
	}, nil
}

// Enabled reports whether the client is configured for live R2 operations.
func (c *Client) Enabled() bool {
	return c != nil && c.cfg.Enabled && c.s3 != nil
}

// Config returns a copy of the client config.
func (c *Client) Config() Config {
	if c == nil {
		return Config{}
	}
	return c.cfg
}

// PutObject streams body to R2.
// When size >= 0 it is sent as Content-Length. When size < 0, the body is
// buffered up to MaxObjectBytes so the SDK has a known length (gateway media
// sizes are capped; avoids the deprecated s3/manager package).
func (c *Client) PutObject(ctx context.Context, key, contentType string, body io.Reader, size int64) error {
	if !c.Enabled() {
		return fmt.Errorf("r2 client is not enabled")
	}

	var reader io.Reader = body
	var contentLength int64

	if size >= 0 {
		contentLength = size
	} else {
		capBytes := c.cfg.MaxObjectBytes()
		if capBytes <= 0 {
			capBytes = 512 * 1024 * 1024
		}
		buf, err := io.ReadAll(io.LimitReader(body, capBytes+1))
		if err != nil {
			return fmt.Errorf("r2 read body %s: %w", key, err)
		}
		if int64(len(buf)) > capBytes {
			return fmt.Errorf("r2 object %s exceeds max size %d bytes", key, capBytes)
		}
		reader = bytes.NewReader(buf)
		contentLength = int64(len(buf))
	}

	input := &s3.PutObjectInput{
		Bucket:        aws.String(c.cfg.Bucket),
		Key:           aws.String(key),
		Body:          reader,
		ContentType:   aws.String(contentType),
		ContentLength: aws.Int64(contentLength),
	}
	_, err := c.s3.PutObject(ctx, input)
	if err != nil {
		return fmt.Errorf("r2 put object %s: %w", key, err)
	}
	return nil
}

// HeadObject returns size and content-type when the object exists.
func (c *Client) HeadObject(ctx context.Context, key string) (size int64, contentType string, err error) {
	if !c.Enabled() {
		return 0, "", fmt.Errorf("r2 client is not enabled")
	}
	out, err := c.s3.HeadObject(ctx, &s3.HeadObjectInput{
		Bucket: aws.String(c.cfg.Bucket),
		Key:    aws.String(key),
	})
	if err != nil {
		return 0, "", err
	}
	if out.ContentLength != nil {
		size = *out.ContentLength
	}
	if out.ContentType != nil {
		contentType = *out.ContentType
	}
	return size, contentType, nil
}

// DeleteObject removes a key.
func (c *Client) DeleteObject(ctx context.Context, key string) error {
	if !c.Enabled() {
		return fmt.Errorf("r2 client is not enabled")
	}
	_, err := c.s3.DeleteObject(ctx, &s3.DeleteObjectInput{
		Bucket: aws.String(c.cfg.Bucket),
		Key:    aws.String(key),
	})
	return err
}

// PresignGetURL returns a time-limited HTTPS URL for downloading the object.
func (c *Client) PresignGetURL(ctx context.Context, key string, ttl time.Duration) (string, error) {
	if !c.Enabled() {
		return "", fmt.Errorf("r2 client is not enabled")
	}
	if ttl <= 0 {
		ttl = time.Duration(c.cfg.PresignTTLSeconds) * time.Second
	}
	out, err := c.presign.PresignGetObject(ctx, &s3.GetObjectInput{
		Bucket: aws.String(c.cfg.Bucket),
		Key:    aws.String(key),
	}, s3.WithPresignExpires(ttl))
	if err != nil {
		return "", fmt.Errorf("r2 presign get %s: %w", key, err)
	}
	return out.URL, nil
}

// GetObject streams object body (caller must close).
func (c *Client) GetObject(ctx context.Context, key string) (body io.ReadCloser, contentType string, size int64, err error) {
	if !c.Enabled() {
		return nil, "", 0, fmt.Errorf("r2 client is not enabled")
	}
	out, err := c.s3.GetObject(ctx, &s3.GetObjectInput{
		Bucket: aws.String(c.cfg.Bucket),
		Key:    aws.String(key),
	})
	if err != nil {
		return nil, "", 0, err
	}
	if out.ContentLength != nil {
		size = *out.ContentLength
	}
	if out.ContentType != nil {
		contentType = *out.ContentType
	}
	return out.Body, contentType, size, nil
}

// IsNotFound reports whether err is a missing-object error.
func IsNotFound(err error) bool {
	if err == nil {
		return false
	}
	var nsk *types.NoSuchKey
	if errors.As(err, &nsk) {
		return true
	}
	var nf *types.NotFound
	if errors.As(err, &nf) {
		return true
	}
	var apiErr smithy.APIError
	if errors.As(err, &apiErr) {
		code := apiErr.ErrorCode()
		if code == "NoSuchKey" || code == "NotFound" || code == "404" {
			return true
		}
	}
	msg := strings.ToLower(err.Error())
	return strings.Contains(msg, "nosuchkey") || strings.Contains(msg, "not found") || strings.Contains(msg, "status code: 404")
}
