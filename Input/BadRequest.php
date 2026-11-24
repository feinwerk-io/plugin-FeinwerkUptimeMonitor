<?php

/**
 * Matomo - free/libre analytics platform
 *
 * @link    https://matomo.org
 * @license https://www.gnu.org/licenses/gpl-3.0.html GPL v3 or later
 */

namespace Piwik\Plugins\FeinwerkUptimeMonitor\Input;

use Piwik\Http\HttpCodeException;

/**
 * Bad input to an API method: Matomo answers with HTTP 400 and the message. An own class because core's
 * BadRequestException drops its code on Matomo 5.0.0, the floor of this plugin (the answer would stay HTTP 200 there).
 */
final class BadRequest extends \Exception implements HttpCodeException
{
    public function __construct(string $message, int $code = 400, ?\Throwable $previous = null)
    {
        parent::__construct($message, $code, $previous);
    }
}
