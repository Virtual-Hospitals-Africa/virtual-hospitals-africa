export default function getAreaNameByType(
  addressComponents: Array<any>,
  areaType: string,
): string {
  for (const component of addressComponents) {
    if (component.types?.includes(areaType)) {
      return component.short_name ?? component.long_name ?? 'unknown'
    }
  }
  return 'unknown'
}
