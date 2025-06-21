# Google Calendar Event ID Size Recommendation

When adding the `googleCalendarEventId` attribute to your Appwrite collection schema:

1. **Attribute Type**: String
2. **Size**: 512 characters (recommended)
3. **Required**: No (leave unchecked)
4. **Array**: No (leave unchecked)
5. **Default**: Leave empty

## Explanation

While typical Google Calendar event IDs are around 26-28 characters in length, setting the size to 512 characters provides ample buffer for:

- Any potential changes to Google's ID format in the future
- Special cases or variations in ID length
- Unforeseen requirements

This larger size ensures you won't encounter truncation issues while still keeping the size reasonable for database storage.

## Example Google Calendar Event ID format

Google Calendar event IDs typically look like this:
`abc123def456ghi789jkl012mn`

While the current format is relatively short, it's always best to allow extra space as a precaution.
