import { basename } from 'node:path'

// TODO: How to make this better?(Kane)
const phone_number_id = '113792741736396';

export async function uploadMedia(
    filePath: string, 
    fileType: string, 
): Promise<string> {
  const fileContent = await Deno.readFile(filePath);
  const fileBlob = new Blob([fileContent], { type: fileType });
  const formData = new FormData();

  formData.append('file', fileBlob, basename(filePath));
  formData.append('type', fileType);
  formData.append('messaging_product', 'whatsapp');

  const response = await fetch(`https://graph.facebook.com/v20.0/${phone_number_id}/media`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${Deno.env.get('WHATSAPP_BEARER_TOKEN')}`
    },
    body: formData
  });

  if (!response.ok) {
    throw new Error(`Error uploading media: ${response.statusText}`);
  }

  const result = await response.json();
  return result.id;
}
