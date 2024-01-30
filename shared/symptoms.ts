import groupBy from '../util/groupBy.ts'
import groupByUniq from '../util/groupByUniq.ts'
import parseCsv from '../util/parseCsv.ts'
import uniq from '../util/uniq.ts'

const symptoms_def: {
  category: string
  symptoms: [string, string[], (['*'] | string[])][]
}[] = [{
  'category': 'General',
  'symptoms': [
    ['chills', [
      'rigor',
      'shivering and feeling very cold',
      'shivers',
      'shakes',
    ], []],
    ['cold intolerance', ['cold sensitive'], []],
    ['constipation', [
      'difficulty passing stool',
      'low or no bowel movement',
      'difficult or infrequent feces evacuation',
    ], []],
    ['cough', ['wheeze', 'tussis'], []],
    ['diarrhea', [
      'loose stool',
      'watery stool',
      'running stomach',
      'loose bowels',
      'dysentry',
    ], []],
    ['dizziness', [
      'fainting',
      'lightheadedness',
      'vertigo',
      'woozy',
      'giddiness',
    ], []],
    ['dyspepsia', ['agita', 'indigestion', 'upset stomach'], []],
    ['dyspnea', [
      'shortness of breath',
      'breathlessness',
      'orthopnea',
      'difficulty breathing',
    ], []],
    ['fatigue', [], []],
    ['fever', [], []],
    ['flatulence', [], []],
    ['halitosis', [], []],
    ['heartburn', [], []],
    ['heat intolerance', [], []],
    ['hiccups', [], []],
    ['hoarse voice', [], []],
    ['nausea', [], []],
    ['night sweats', [], []],
    ['palpitations', [], []],
    ['paresthesia', [], ['*']],
    ['polydipsia', [], []],
    ['polyphagia', [], []],
    ['polyuria', [], []],
    ['pruritis', ['itchy skin'], ['*']],
    ['red eye', [], ['both eyes', 'left eye', 'right eye']],
    ['salt, craving', [], []],
    ['skin rash', [], ['*']],
    ['vomiting', [], []],
  ],
}, {
  'category': 'Pain',
  'symptoms': [
    ['abdominal pain', [
      'abdominal discomfort',
      'bloated',
      'stomach gases',
      'stomach pain',
      'bellyaches',
      'abdominal pangs',
      'stomach pangs',
    ], ['generalized', 'left abdomen', 'right abdomen']],
    ['ankle pain', [
      'sprained ankles',
      'twisted ankles',
      'sore ankles',
      'ankle discomfort',
    ], ['both ankles', 'left ankle', 'right ankle']],
    ['arm pain', ['sore arm', 'aching arm', 'arm discomfort'], [
      'both arms',
      'left arm',
      'right arm',
    ]],
    ['back pain', [
      'backache',
      'back discomfort',
      'sore back',
      'back pangs',
    ], ['generalized', 'upper back', 'lower back', 'central']],
    ['breast pain', ['breast discomfort'], [
      'both breasts',
      'left breast',
      'right breast',
    ]],
    ['chest pain', [
      'pain in the chest',
      'angina',
      'pectoralgia',
      'angina',
      'pectoris',
      'cardiac chest pain',
      'discomfort in the chest',
      'heart pain',
      'heaviness in the chest',
      'pressure in the chest',
      'thoracic pain',
      'tightness in the chest',
      'chest cramp',
      'chest tightness',
    ], ['generalized', 'left side', 'right side', 'central']],
    ['dysmenorrhea', [
      'menstrual cramps',
      'menstrual pain',
      'period pain',
      'period cramps',
      'painful menstrustion',
      'painful periods',
      ' period pain',
    ], ['lower abdomen']],
    ['dysuria', [
      'painful urination',
      'difficult urination',
      'urinary discomfort',
      'urinary burning',
      'mictrution pain',
    ], ['generalized', 'urethra']],
    ['earache', ['ear pain', 'otalgia'], [
      'both ears',
      'left ear',
      'right ear',
    ]],
    ['elbow pain', ['sprained elbow', 'dislocated elbow', 'fractured elbow'], [
      'both elbows',
      'left elbow',
      'right elbow',
    ]],
    ['eye pain', [
      'opthalmagia',
      'ocular pain',
      'orbirtal pain',
      'sore eyes',
      'eye discomfort',
      'eye ache',
    ], ['both eyes', 'left eye', 'right eye']],
    ['facial pain', [], ['generalized', 'left side', 'right side']],
    ['foot and toe pain', [], []],
    ['girdle pain', [], [
      'generalized',
      'pelvis',
      'lower back',
      'left thigh_right thigh',
      'left hip',
      'right hip',
    ]],
    ['hand pain', [], ['both hands', 'left hand', 'right hand']],
    ['headache', [], [
      'generalized',
      'left side',
      'right side',
      'back side',
      'front side',
    ]],
    ['finger pain', [], [
      'left thumb',
      'left index finger',
      'left middle finger',
      'left ring finger',
      'left little finger',
      'right thumb',
      'right index finger',
      'right middle finger',
      'right ring finger',
      'right little finger',
    ]],
    ['hip pain', [], ['both hips', 'left hip', 'right hip']],
    ['jaw pain', [], ['both jaws', 'left jaw', 'right jaw']],
    ['joint pain', [], ['*']],
    ['knee pain', [], ['both knees', 'left knee', 'right knee']],
    ['leg pain', [], ['both legs', 'left leg', 'right leg']],
    ['musculoskeletal pain, generalized', [], []],
    ['neck pain', [], [
      'generalized',
      'left side',
      'right side',
      'back side',
      'front side',
      'throat',
    ]],
    ['scrotal pain', [], ['scrotum']],
    ['shoulder pain', [], [
      'both shoulders',
      'left shoulder',
      'right shoulder',
    ]],
    ['toothache', [], [
      'generalized',
      'right molars',
      'left molars',
      'incisor',
      'canine',
    ]],
    ['throat pain', [], ['throat']],
    ['wrist pain', [], ['both wrists', 'left wrist', 'right wrist']],
  ],
}, {
  'category': 'Wound/mass',
  'symptoms': [
    ['abdominal mass', ['swollen abdomen'], [
      'generalized',
      'left abdomen',
      'right abdomen',
    ]],
    ['abrasion', ['scratch', 'injury', 'lesion', 'cut', 'laceration'], ['*']],
    ['bite', ['pierce', 'gnaw', 'sting'], ['*']],
    ['sting', [], ['*']],
    ['bone mass or swelling', [], ['*']],
    ['breast mass', ['breast lump', 'breast cyst', 'swollen breast'], [
      'both breasts',
      'left breast',
      'right breast',
    ]],
    ['bruise', [], ['*']],
    ['burn', ['thermal burns', 'burn injuries', 'scalds'], ['*']],
    ['laceration', ['cut'], ['*']],
    ['groin mass', [], ['groin']],
    ['facial swelling', [], ['generalized', 'left side', 'right side']],
    ['foot ulcer', [], ['both feet', 'right foot', 'left foot']],
    ['foreign body', [], ['*']],
    ['genital lesions', [], [
      'penis',
      'urethra',
      'vagina',
      'clitoris',
      'vulva',
      'anus',
      'scrotum',
    ]],
    ['gum swelling', [], []],
    ['head mass or swelling', [], [
      'generalized',
      'left side',
      'right side',
      'back side',
      'front side',
    ]],
    ['jaw swelling', [], ['both jaws', 'left jaw', 'right jaw']],
    ['joint swelling', [], ['*']],
    ['leg ulcer', [], ['both legs', 'left leg', 'right leg']],
    ['mouth lesions', [], ['mouth']],
    ['scrotal swelling', [], ['scrotum']],
    ['ulcer', [], ['*']],
  ],
}, {
  'category': 'Discharge',
  'symptoms': [
    ['enuresis', ['bed wetting'], []],
    ['eye discharge', [
      'eye secretions',
      'conjuctival discharge',
      'excessive rheum',
      'ocular discharge',
    ], ['both eyes', 'left eye', 'right eye']],
    ['fecal incontinence', [], []],
    ['otorrhea', ['ear discharge'], ['both ears', 'left ear', 'right ear']],
    ['rhinorrhea', ['nasal discharge'], [
      'generalized',
      'left side',
      'right side',
    ]],
    ['urethral discharge', [], ['urethra']],
    ['urinary incontinence', [], ['urethra']],
    ['vaginal discharge', [], ['vagina']],
  ],
}, {
  'category': 'Bleeding',
  'symptoms': [
    ['gum bleeding', [], ['both gums', 'upper gums', 'lower gums']],
    ['epistaxis', ['nosebleed', 'bleeding from the nose'], [
      'both nostrils',
      'left nose',
      'right nose',
    ]],
    ['hematemesis', [], []],
    ['hematuria', [], ['urethra']],
    ['hemoptysis', ['coughing up blood'], []],
    ['melena', [], []],
    ['menorrhagia', [], []],
    ['rectal bleeding', [], ['rectum']],
    ['vaginal bleeding', [], ['vagina']],
  ],
}, {
  'category': 'Loss/difficulty',
  'symptoms': [
    ['alopecia', ['hair loss', 'baldness', 'male pattern hair loss'], ['head']],
    ['amenorrhea', [
      'no monthly flow',
      'no monthly periods',
      'abnormal menstruation',
    ], []],
    ['anosmia', ['loss of smell', 'smell blindness', 'odor blindness'], [
      'nose',
    ]],
    ['aphasia', [
      'communication disorder',
      'inarticulate',
      'without or deprived of speech or words',
    ], []],
    ['dysphagia', ['swallowing disorders', 'difficulty swallowing'], []],
    ['difficulty urinating', ['urinary hesitancy', 'urinary retention'], []],
    ['erectile dysfunction', [
      'impotence',
      'inability to copulate',
      'difficulty getting an erection',
      'difficulty keeping an erection',
    ], []],
    ['hearing loss', [], ['both ears', 'left ear', 'right ear']],
    ['infertility', [], []],
    ['insomnia', [], []],
    ['memory loss', [], []],
    ['vision loss', [], ['both eyes', 'left eye', 'right eye']],
  ],
}, {
  'category': 'Abnormal behavior',
  'symptoms': [
    ['confusion', [
      'distracted',
      'unhinged',
      'unsettled',
      'deranged',
      'disheveled',
      'discomposed',
      'agitated',
      'fazed',
      'mortified',
      'distracted ',
    ], []],
    ['convulsions', [
      'involuntary body movements',
      'irregular body movements',
      'fit',
      'paroxysm',
      'seizure',
    ], []],
    ['delusions', ['paranoid', 'hallucinating', 'neurotic'], []],
    ['depression', ['mood disorder', 'gloomy', 'dejected', 'desolate'], []],
    ['drop attack', [
      'sudden fall without loss of conciousness',
      'atonic seizures',
      'drop seizures',
      'akinetic seizures',
    ], []],
    ['hallucinations', [], []],
    ['mood changes', [], []],
    ['psychotic behavior', [], []],
    ['violent behavior', [], []],
  ],
}, {
  'category': 'Abnormal function',
  'symptoms': [
    ['appetite problems', [
      'loss of appetite',
      'decreased appetite',
      'unable to eat',
      'does not feel hunger',
      'absence of desire to eat',
      'food aversion',
      'ravenous',
      'always hungry',
      'the munchies',
      'extreme appetite',
    ], []],
    ['hearing problems', [], ['both ears', 'left ear', 'right ear']],
    ['movement problems', [], ['*']],
    ['menstruation problems', [], []],
    ['salivation problems', [], ['mouth']],
    ['sleep problems', [], []],
    ['speech problems', [], []],
    ['sexual problems', [], []],
    ['sweat problems', [], []],
    ['taste problems', [], []],
    ['thirst problems', [], []],
    ['tremors', [], ['*']],
    ['trismus', ['lockjaw'], ['jaw']],
    ['visual problems', [], ['both eyes', 'left eye', 'right eye']],
    ['voice problems', [], []],
    ['writing problems', [], []],
    ['weight problems', [], []],
  ],
}]

export function writeSymptomsTsv() {
  console.log('symptom\tcategory\taliases\tsites')
  SYMPTOMS.forEach((s) => {
    console.log(
      `${s.symptom}\t${s.category}\t${JSON.stringify(s.aliases)}\t${
        s.sites.length ? JSON.stringify(s.sites) : 'n/a'
      }`,
    )
  })
}

export async function parseSymptomsTsv() {
  const tsv = new Map<string, {
    aliases: string[]
    sites: ['*'] | string[]
  }>()
  for await (
    let { symptom, aliases, sites } of parseCsv('./db/resources/symptoms.tsv', {
      columnSeparator: '	',
      quote: "'",
    })
  ) {
    symptom = symptom.trim().toLowerCase()
    aliases = aliases.trim().toLowerCase()
    sites = sites.trim().toLowerCase()
    tsv.set(symptom, {
      aliases: aliases
        .replace('{', '')
        .replace('}', '')
        .split(',')
        .map((a) => {
          if (a.startsWith('"') && a.endsWith('"')) {
            return a.slice(1, -1)
          }
          return a
        }).filter((a) => a),
      sites: sites === 'n/a'
        ? []
        : (sites === 'any site' || sites === '*')
        ? ['*']
        : (sites.split('/')
          .map((a) => {
            if (a.startsWith('"') && a.endsWith('"')) {
              return a.slice(1, -1)
            }
            return a
          }).filter((s) => s)).sort((a, b) => {
            if (a.includes('both') || a.includes('generalized')) {
              return -1
            }
            if (b.includes('both') || b.includes('generalized')) {
              return 1
            }
            return 0
          }),
    })
  }

  const symptoms_array = symptoms_def.flatMap(({ category, symptoms }) => (
    symptoms.map(([symptom, aliases]) => {
      symptom = symptom.trim().toLowerCase()
      aliases = aliases.map((a) => a.trim().toLowerCase())
      const matching_tsv = tsv.get(symptom)!
      if (matching_tsv) {
        aliases = uniq(aliases.concat(matching_tsv.aliases))
      }
      return {
        category,
        symptom,
        aliases,
        sites: matching_tsv?.sites ?? [],
      }
    })
  ))

  const symptoms_by_category = []
  for (
    const [category, symptoms_of_category] of groupBy(
      symptoms_array,
      (s) => s.category,
    )
  ) {
    const symptoms = symptoms_of_category.map((
      { symptom, aliases, sites },
    ) => [symptom, aliases, sites])
    symptoms_by_category.push({
      category,
      symptoms,
    })
  }
  console.log(JSON.stringify(symptoms_by_category))
}

export const SYMPTOMS = symptoms_def.flatMap(({ category, symptoms }) => (
  symptoms.map(([symptom, aliases, sites]) => ({
    category,
    symptom,
    aliases,
    sites,
  }))
))

export const SYMPTOMS_BY_NAME = groupByUniq(SYMPTOMS, (s) => s.symptom)
