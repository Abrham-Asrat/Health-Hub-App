using System.Text.Json.Serialization;

public class ChapaWebhookDto
{
    [JsonPropertyName("event")]
    public string Event { get; set; } = null!;

    [JsonPropertyName("type")]
    public string Type { get; set; } = null!;

    [JsonPropertyName("status")]
    public string Status { get; set; } = null!;

    [JsonPropertyName("tx_ref")]
    public string TxRef { get; set; } = null!;

    [JsonPropertyName("amount")]
    public decimal Amount { get; set; }

    [JsonPropertyName("payment_method")]
    public string PaymentMethod { get; set; } = null!;

    [JsonPropertyName("reference")]
    public string Reference { get; set; } = null!;
}