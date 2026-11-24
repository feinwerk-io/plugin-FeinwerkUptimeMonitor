<?php

/**
 * Matomo - free/libre analytics platform
 *
 * @link    https://matomo.org
 * @license https://www.gnu.org/licenses/gpl-3.0.html GPL v3 or later
 */

namespace Piwik\Plugins\FeinwerkSentinel\Check;

/**
 * Outcome of a check for one subject.
 *
 * - firing: the problem is there. Opens an incident unless one is open (or the window is in a quiet period).
 * - normal: no problem. Resolves an open incident.
 * - unknown: cannot tell (not enough data, too little traffic). Changes nothing.
 */
class CheckResult
{
    public const FIRING = 'firing';
    public const NORMAL = 'normal';
    public const UNKNOWN = 'unknown';

    private string $state;
    private string $subject;
    private ?float $value = null;
    private ?float $expected = null;
    private string $messageKey = '';
    /** @var array<int, string|int|float> */
    private array $messageParams = [];
    private ?\DateTimeImmutable $windowFrom = null;
    private ?\DateTimeImmutable $windowTo = null;
    private array $details = [];
    private ?string $severity = null;
    private string $reason = '';

    private function __construct(string $state, string $subject)
    {
        $this->state = $state;
        $this->subject = $subject;
    }

    /**
     * @param array<int, string|int|float> $messageParams values for the placeholders of $messageKey
     * @param array $details JSON-serialisable extra data (shown to other plugins and in the webhook payload)
     * @param string|null $severity overrides the check's default severity for this result
     */
    public static function firing(
        string $subject,
        ?float $value,
        ?float $expected,
        string $messageKey,
        array $messageParams,
        \DateTimeImmutable $windowFrom,
        \DateTimeImmutable $windowTo,
        array $details = [],
        ?string $severity = null
    ): self {
        $result = new self(self::FIRING, $subject);
        $result->value = $value;
        $result->expected = $expected;
        $result->messageKey = $messageKey;
        $result->messageParams = array_values($messageParams);
        $result->windowFrom = $windowFrom;
        $result->windowTo = $windowTo;
        $result->details = $details;
        $result->severity = $severity;

        return $result;
    }

    public static function normal(string $subject = '', ?float $value = null, ?float $expected = null): self
    {
        $result = new self(self::NORMAL, $subject);
        $result->value = $value;
        $result->expected = $expected;

        return $result;
    }

    public static function unknown(string $subject = '', string $reason = ''): self
    {
        $result = new self(self::UNKNOWN, $subject);
        $result->reason = $reason;

        return $result;
    }

    public function state(): string
    {
        return $this->state;
    }

    public function isFiring(): bool
    {
        return $this->state === self::FIRING;
    }

    public function subject(): string
    {
        return $this->subject;
    }

    public function value(): ?float
    {
        return $this->value;
    }

    public function expected(): ?float
    {
        return $this->expected;
    }

    public function messageKey(): string
    {
        return $this->messageKey;
    }

    public function messageParams(): array
    {
        return $this->messageParams;
    }

    public function windowFrom(): ?\DateTimeImmutable
    {
        return $this->windowFrom;
    }

    public function windowTo(): ?\DateTimeImmutable
    {
        return $this->windowTo;
    }

    public function details(): array
    {
        return $this->details;
    }

    public function severity(): ?string
    {
        return $this->severity;
    }

    public function reason(): string
    {
        return $this->reason;
    }
}
