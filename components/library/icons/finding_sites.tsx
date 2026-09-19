import { JSX } from 'preact'
import cls from '../../../util/cls.ts'

/*
  A glyph for each body site the warning signs page can be filtered by, drawn on the same
  24x24 outline grid as the heroicons so they sit beside them without looking out of place.
  'Whole body' stands for no filter at all: the page's signs are not narrowed to one site.
*/

type IconProps = JSX.SVGAttributes<SVGSVGElement>

function FindingSiteSvg({ className, children, ...props }: IconProps): JSX.Element {
  return (
    <svg
      fill='none'
      viewBox='0 0 24 24'
      strokeWidth={1.5}
      stroke='currentColor'
      strokeLinecap='round'
      strokeLinejoin='round'
      className={cls('size-5', (className as string) || '')}
      {...props}
    >
      {children}
    </svg>
  )
}

// A person seen head on, drawn as an outline rather than a stick figure
function WholeBody(props: IconProps) {
  return (
    <FindingSiteSvg {...props}>
      <circle cx='12' cy='4' r='2.5' />
      <path d='M9.9 7.05C9 7.2 8 7.6 7.41 8.08L4.81 14.48A.95.95 0 0 0 6.39 15.12L8.99 8.72L9.5 13.2L8.9 15.5L8.7 20.9L10.2 20.9L11.7 14.3L12 13.8L12.3 14.3L13.8 20.9L15.3 20.9L15.1 15.5L14.5 13.2L15.01 8.72L17.61 15.12A.95.95 0 0 0 19.19 14.48L16.59 8.08C16 7.6 15 7.2 14.1 7.05Z' />
    </FindingSiteSvg>
  )
}

// A head in profile, the face turned to the right
function Head(props: IconProps) {
  return (
    <FindingSiteSvg {...props}>
      <path d='M16.8 20.6v-2.4c0-1 .6-1.6 1.4-2.1 1.3-.8 2-2.2 2-3.9 0-4.5-3.4-8-7.8-8-4 0-7.2 2.9-7.2 6.9 0 2 .8 3.3 1.8 4.4.6.7.9 1.2.9 2.1v3' />
      <path d='M9.8 10.3v.01' />
      <path d='M15 10.3v.01' />
      <path d='M11.6 13.6a2.6 2.6 0 0 0 2.6 0' />
    </FindingSiteSvg>
  )
}

// An open eye seen head on, iris at its centre
function Eye(props: IconProps) {
  return (
    <FindingSiteSvg {...props}>
      <path d='M2.6 12S6.1 6.4 12 6.4 21.4 12 21.4 12s-3.5 5.6-9.4 5.6S2.6 12 2.6 12Z' />
      <circle cx='12' cy='12' r='2.4' />
    </FindingSiteSvg>
  )
}

// A face head on: two eyes and a mouth
function Face(props: IconProps) {
  return (
    <FindingSiteSvg {...props}>
      <circle cx='12' cy='12' r='9' />
      <path d='M9 10.2v.01' />
      <path d='M15 10.2v.01' />
      <path d='M8.4 14.4a4.4 4.4 0 0 0 7.2 0' />
    </FindingSiteSvg>
  )
}

// The outer ear: a crescent helix tapering to the lobe, the antihelix curling within
function Ear(props: IconProps) {
  return (
    <FindingSiteSvg {...props}>
      <path d='M15.4 8C15 4.6 12.4 2.8 9.8 3.6 6.6 4.6 5.2 7.6 5.4 11.2c.2 3.2 1.6 5.4 3 7.2 1 1.4 2.2 2.4 3.6 2.2 1.4-.2 2-1.4 1.8-2.8' />
      <path d='M13.6 8.6c-2.2-.6-4.2.6-4.6 2.8-.3 1.8.8 3.2 2.4 3.2 1.1 0 1.9-.7 1.9-1.8' />
    </FindingSiteSvg>
  )
}

// A nose in profile: bridge, tip and nostril
function Nose(props: IconProps) {
  return (
    <FindingSiteSvg {...props}>
      <path d='M9.4 3.2c0 3.4.2 5-.6 6.8-.6 1.4-2.1 3.1-2.1 4.4 0 1.1.9 1.7 2.1 1.7h1.1' />
      <path d='M9.9 16.1v1.2c0 1.6 1.6 2.7 3.7 2.7 1.7 0 3.2-.5 4.1-1.4' />
    </FindingSiteSvg>
  )
}

// Lips parted, the mouth opening onto the throat
function MouthOrThroat(props: IconProps) {
  return (
    <FindingSiteSvg {...props}>
      <path d='M3.6 11.7c2.7-2.9 5.1-4.3 6.8-4.3.9 0 1.2.8 1.6.8s.7-.8 1.6-.8c1.7 0 4.1 1.4 6.8 4.3' />
      <path d='M3.6 11.7c2.7 3.5 5.4 5.2 8.4 5.2s5.7-1.7 8.4-5.2' />
      <path d='M3.6 11.7c2.8.7 5.6 1 8.4 1s5.6-.3 8.4-1' />
    </FindingSiteSvg>
  )
}

// A molar, its crown above the gum line
function GumsAndTeeth(props: IconProps) {
  return (
    <FindingSiteSvg {...props}>
      <path d='M12 3.4c-1.9 0-2.5-.8-4.2-.8C5.3 2.6 4.1 4.4 4.1 7c0 2.9 1.2 4.3 1.8 6.9.5 2.3.7 5.2 2.2 5.2 1.4 0 1.5-2.5 2-4.7.3-1.3.9-2.1 1.9-2.1s1.6.8 1.9 2.1c.5 2.2.6 4.7 2 4.7 1.5 0 1.7-2.9 2.2-5.2.6-2.6 1.8-4 1.8-6.9 0-2.6-1.2-4.4-3.7-4.4-1.7 0-2.3.8-4.2.8Z' />
      <path d='M6.2 8.8c1.8-1.1 9.8-1.1 11.6 0' />
    </FindingSiteSvg>
  )
}

// A neck between jaw and shoulders, the sternocleidomastoid running down it
function Neck(props: IconProps) {
  return (
    <FindingSiteSvg {...props}>
      <path d='M6.4 3.2c1 1.9 3 3 5.6 3s4.6-1.1 5.6-3' />
      <path d='M9.4 6v4.6c0 1.4-.7 2.1-1.9 2.6-2 .9-3.3 2.1-3.3 4.2v3.4' />
      <path d='M14.6 6v4.6c0 1.4.7 2.1 1.9 2.6 2 .9 3.3 2.1 3.3 4.2v3.4' />
    </FindingSiteSvg>
  )
}

// A rib cage, the sternum down its middle
function Chest(props: IconProps) {
  return (
    <FindingSiteSvg {...props}>
      <path d='M12 4.2v14' />
      <path d='M12 7.2c-1.9-1.5-4.1-2.2-6.6-2.2v4.6c0 3.8 2.8 6.9 6.6 8' />
      <path d='M12 7.2c1.9-1.5 4.1-2.2 6.6-2.2v4.6c0 3.8-2.8 6.9-6.6 8' />
      <path d='M5.7 9.6c2.2 0 4.3.6 6.3 1.8' />
      <path d='M18.3 9.6c-2.2 0-4.3.6-6.3 1.8' />
    </FindingSiteSvg>
  )
}

// A belly seen head on, the navel at its centre
function Abdomen(props: IconProps) {
  return (
    <FindingSiteSvg {...props}>
      <path d='M5.4 4.2v7.2c0 4.3 2.9 8 6.6 8s6.6-3.7 6.6-8V4.2' />
      <path d='M5.4 6.6c4.4 1.4 8.8 1.4 13.2 0' />
      <path d='M12 12.4v.01' />
    </FindingSiteSvg>
  )
}

// Both breasts seen head on, each with its nipple
function Breast(props: IconProps) {
  return (
    <FindingSiteSvg {...props}>
      <path d='M4.2 8.4C3.4 9.6 3 10.8 3 12.2 3 14.9 5.2 17 7.9 17c2.4 0 4.1-1.6 4.1-3.6 0 2 1.7 3.6 4.1 3.6 2.7 0 4.9-2.1 4.9-4.8 0-1.4-.4-2.6-1.2-3.8' />
      <circle cx='7.9' cy='12.8' r='1.4' />
      <circle cx='16.1' cy='12.8' r='1.4' />
    </FindingSiteSvg>
  )
}

// The anal canal opening at the centre of a ring of folds
function AnalAndRectal(props: IconProps) {
  return (
    <FindingSiteSvg {...props}>
      <path d='M12 3.2v5.4' />
      <path d='M9.6 8.6c-1.6 0-2.8 1.1-2.8 2.6 0 1.1.6 1.9 1.5 2.4-1.8.5-3 1.9-3 3.6 0 2.2 2.1 3.8 4.9 3.8h3.6c2.8 0 4.9-1.6 4.9-3.8 0-1.7-1.2-3.1-3-3.6.9-.5 1.5-1.3 1.5-2.4 0-1.5-1.2-2.6-2.8-2.6Z' />
      <circle cx='12' cy='16.4' r='1.8' />
    </FindingSiteSvg>
  )
}

// A bladder with the urethra below it and the ureters entering above
function Urinary(props: IconProps) {
  return (
    <FindingSiteSvg {...props}>
      <path d='M7.4 2.8 9.4 8.6' />
      <path d='M16.6 2.8 14.6 8.6' />
      <path d='M9 8.6h6c2.4 0 4.2 1.9 4.2 4.4 0 3.3-2.6 5.8-5.6 5.8h-3.2c-3 0-5.6-2.5-5.6-5.8 0-2.5 1.8-4.4 4.2-4.4Z' />
      <path d='M12 18.8v2.6' />
    </FindingSiteSvg>
  )
}

// The scrotal sac, both cords descending into it
function Genital(props: IconProps) {
  return (
    <FindingSiteSvg {...props}>
      <path d='M9 3.4v2.4c0 1.6-.8 2.4-2 3.2-1.8 1.2-2.8 2.8-2.8 4.8 0 3.1 2.4 5.6 5.4 5.6h4.8c3 0 5.4-2.5 5.4-5.6 0-2-1-3.6-2.8-4.8-1.2-.8-2-1.6-2-3.2V3.4' />
      <path d='M12 19.4v-6.2' />
    </FindingSiteSvg>
  )
}

// Two bone ends meeting across a joint space
function Joint(props: IconProps) {
  return (
    <FindingSiteSvg {...props}>
      <path d='M9.3 2.6v4.4c0 1.4-1.6 2-1.6 3.6 0 1.3 1.9 1.8 4.3 1.8s4.3-.5 4.3-1.8c0-1.6-1.6-2.2-1.6-3.6V2.6' />
      <path d='M9.3 21.4v-4.4c0-1.4-1.6-2-1.6-3.6 0-1.3 1.9-1.8 4.3-1.8s4.3.5 4.3 1.8c0 1.6-1.6 2.2-1.6 3.6v4.4' />
    </FindingSiteSvg>
  )
}

// A spine seen from behind, its vertebrae stacked between the shoulder blades
function Back(props: IconProps) {
  return (
    <FindingSiteSvg {...props}>
      <path d='M12 3.4v17.2' />
      <path d='M9.6 6.2h4.8' />
      <path d='M9.2 9.6h5.6' />
      <path d='M9.2 13h5.6' />
      <path d='M9.6 16.4h4.8' />
      <path d='M5.2 4.6c0 3.1 1.2 5 2.9 5.9' />
      <path d='M18.8 4.6c0 3.1-1.2 5-2.9 5.9' />
    </FindingSiteSvg>
  )
}

// An arm bent at the elbow, shoulder to wrist
function Arm(props: IconProps) {
  return (
    <FindingSiteSvg {...props}>
      <path d='M4.6 6.4a2.9 2.9 0 0 1 5.8 0v1.8c0 2.1 1.5 3.5 3.5 4.3 2.6 1.1 4.3 2.7 4.3 5.3v3h-4.8v-2.7c0-1.3-1-2.2-2.4-2.8-3.3-1.4-6.4-3.4-6.4-7.4V6.4Z' />
      <path d='M13.4 20.8h4.8' />
    </FindingSiteSvg>
  )
}

// An open palm, fingers and thumb
function Hand(props: IconProps) {
  return (
    <FindingSiteSvg {...props}>
      <path d='M8.6 12V5.3a1.35 1.35 0 0 1 2.7 0V12' />
      <path d='M11.3 11.4V4.2a1.35 1.35 0 0 1 2.7 0v7.2' />
      <path d='M14 11.7V5.6a1.35 1.35 0 0 1 2.7 0v7.3' />
      <path d='M8.6 12V8.2a1.35 1.35 0 0 0-2.7 0v7.3a6 6 0 0 0 6 6h2a4.7 4.7 0 0 0 4.7-4.7v-3.9' />
    </FindingSiteSvg>
  )
}

// Both legs seen head on, hip to foot
function Leg(props: IconProps) {
  return (
    <FindingSiteSvg {...props}>
      <path d='M7.8 4.2C6.9 5.6 6.6 7 6.6 8.4L7.2 13.2L8.4 18.4C7.6 19.1 7.1 19.9 7.1 20.5C7.1 20.9 7.4 21.2 7.9 21.2L9.9 21.2C10.4 21.2 10.6 20.9 10.5 20.5C10.4 19.8 10.3 19.1 10.2 18.4L10.5 13.2L11.5 10L12 9.4L12.5 10L13.5 13.2L13.8 18.4C13.7 19.1 13.6 19.8 13.5 20.5C13.4 20.9 13.6 21.2 14.1 21.2L16.1 21.2C16.6 21.2 16.9 20.9 16.9 20.5C16.9 19.9 16.4 19.1 15.6 18.4L16.8 13.2L17.4 8.4C17.4 7 17.1 5.6 16.2 4.2Z' />
    </FindingSiteSvg>
  )
}

// A foot in profile: ankle, heel, arch and toes, the ankle bone marked
function Foot(props: IconProps) {
  return (
    <FindingSiteSvg {...props}>
      <path d='M7.6 4.6L7.6 11C7.6 13.4 6.4 15 6 17C5.7 18.5 6.4 19.7 7.9 19.7C9.8 19.7 10.4 18.1 12.6 18.1C14.5 18.1 15.5 19.4 17.4 19.4C18.9 19.4 19.6 18.5 19.1 17.3C18.5 15.9 14.8 15.3 12.7 14.3C11.8 13.8 11.4 12.8 11.4 11.4L11.4 4.6Z' />
      <path d='M8.6 12.6v.01' />
    </FindingSiteSvg>
  )
}

// A patch of skin, its pores magnified
function Skin(props: IconProps) {
  return (
    <FindingSiteSvg {...props}>
      <path d='M6.6 4.4h10.8a2.2 2.2 0 0 1 2.2 2.2v10.8a2.2 2.2 0 0 1-2.2 2.2H6.6a2.2 2.2 0 0 1-2.2-2.2V6.6a2.2 2.2 0 0 1 2.2-2.2Z' />
      <path d='M8.4 8.6v.01' />
      <path d='M13 7.8v.01' />
      <path d='M16.4 10.4v.01' />
      <path d='M9.4 13v.01' />
      <path d='M14 12.6v.01' />
      <path d='M7.8 16.6v.01' />
      <path d='M12.4 16.8v.01' />
      <path d='M16.2 15.4v.01' />
    </FindingSiteSvg>
  )
}

// The crown of the head, hair whorled about it and strands falling either side
function HairAndScalp(props: IconProps) {
  return (
    <FindingSiteSvg {...props}>
      <path d='M5 20.4v-3.6a7 7 0 0 1 14 0v3.6' />
      <path d='M6.4 14.6c1.5-1.4 3.4-2.1 5.6-2.1s4.1.7 5.6 2.1' />
      <path d='M12 6.6a2.4 2.4 0 1 0 2 3.7' />
      <path d='M5 17.4c-.9 1.3-1.3 2.6-1.3 4' />
      <path d='M19 17.4c.9 1.3 1.3 2.6 1.3 4' />
    </FindingSiteSvg>
  )
}

// A fingertip, its nail plate within the fold
function Nail(props: IconProps) {
  return (
    <FindingSiteSvg {...props}>
      <path d='M7.5 21.4v-11a4.5 4.5 0 0 1 9 0v11' />
      <path d='M7.5 21.4h9' />
      <path d='M9.6 12.3a2.4 2.4 0 0 1 4.8 0v4.2c0 .6-.5 1.1-1.1 1.1h-2.6c-.6 0-1.1-.5-1.1-1.1Z' />
    </FindingSiteSvg>
  )
}

// The label the warning signs page shows when no finding site narrows it
export const WHOLE_BODY_LABEL = 'Whole body'

/*
  Keyed by FINDING_SITES' labels, which test/shared/finding_site_icons.test.ts holds this
  map to, plus WHOLE_BODY_LABEL for the unfiltered page.
*/
export const FINDING_SITE_ICONS = {
  [WHOLE_BODY_LABEL]: WholeBody,
  'Head': Head,
  'Eye': Eye,
  'Face': Face,
  'Ear': Ear,
  'Nose': Nose,
  'Mouth or throat': MouthOrThroat,
  'Gums and teeth': GumsAndTeeth,
  'Chest': Chest,
  'Breast': Breast,
  'Abdomen': Abdomen,
  'Anal & rectal': AnalAndRectal,
  'Genital': Genital,
  'Urinary': Urinary,
  'Joint': Joint,
  'Back': Back,
  'Neck': Neck,
  'Arm': Arm,
  'Hand': Hand,
  'Leg': Leg,
  'Foot': Foot,
  'Skin': Skin,
  'Hair & scalp': HairAndScalp,
  'Nail': Nail,
}

export type FindingSiteIconLabel = keyof typeof FINDING_SITE_ICONS

// The icon for a finding site's label, falling back to the whole body for a site we don't draw
export function findingSiteIcon(label: string): (props: IconProps) => JSX.Element {
  return FINDING_SITE_ICONS[label as FindingSiteIconLabel] || WholeBody
}

export function FindingSiteIcon({ label, ...props }: { label: string } & IconProps): JSX.Element {
  const Icon = findingSiteIcon(label)
  return <Icon {...props} />
}
