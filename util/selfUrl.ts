export default Deno.env.get('SELF_URL') ||
  `https://localhost:${Deno.env.get('PORT') || 8000}`
