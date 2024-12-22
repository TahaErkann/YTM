using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

namespace YTM.Core.Entities
{
    public class User
    {
        [BsonId]
        [BsonRepresentation(BsonType.ObjectId)]
        public string? Id { get; set; }

        [BsonElement("Email")]
        public string Email { get; set; } = string.Empty;

        [BsonElement("Password")]
        public string Password { get; set; } = string.Empty;

        [BsonElement("Role")]
        public string Role { get; set; } = string.Empty;

        [BsonElement("CreatedDate")]
        public DateTime CreatedDate { get; set; }
    }
} 