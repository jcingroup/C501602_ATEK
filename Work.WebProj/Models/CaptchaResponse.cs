using System.Collections.Generic;
using Newtonsoft.Json;

namespace GooglereCAPTCHa.Models
{
    public class CaptchaResponse
    {
        [JsonProperty("success")]
        public bool Success { get; set; }

        [JsonProperty("error-codes")]
        public List<string> ErrorCodes { get; set; }
    }
    public class ValidateResponse
    {
        public bool Success { get; set; }
        public string Message { get; set; }
    }
}