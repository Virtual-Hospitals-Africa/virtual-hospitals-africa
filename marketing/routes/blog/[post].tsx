// Auto-generated from /blog/*.md
// Do not edit manually - run `deno task compile:blog` to regenerate

import { Context } from 'fresh'
import LayoutBlogPost from '../../../components/library/layout/Blog.tsx'

type BlogPostMeta = {
  title: string
  subtitle?: string
  author?: string
  slug: string
  date: string
  description: string
  tags: string[]
  word_count: number
  hero_image?: string
  wide_image?: string
}

type BlogPost = BlogPostMeta & {
  html: string
}

const BLOG_POSTS: BlogPost[] = [
  {
    title: 'How Health Workers Can Love Their Devices',
    subtitle: 'Learning from Dr. Atul Gawande how to gain in efficiency while letting practitioners focus on care',
    author: undefined,
    slug: 'how-health-workers-can-love-their-devices',
    date: '2026-04-17',
    description: 'How we built our clinical decision support rules engine',
    tags: ['ux design', 'medicine'],
    word_count: 1660,
    hero_image: '/blog/images/how-health-workers-can-love-their-devices/lindiwe-holding-tablet.png',
    wide_image: '/blog/images/how-health-workers-can-love-their-devices/lindiwe-holding-tablet-wide.png',
    html:
      '<p>In his 2015 essay for the New Yorker <a href="https://www.newyorker.com/magazine/2018/11/12/why-doctors-hate-their-computers">Why Doctors Hate Their Computers</a> Dr. Atul Gawande opines the many ways in which digitization of health systems, while making administration and billing more efficient, often frustrates the daily efforts of health workers who primarily want to focus their attention on providing care. </p>\n<p>At <a href="https://www.virtualhospitalsafrica.org/">Virtual Hospitals Africa</a>, we&#39;re designing for a public sector that today is largely reliant on pen and paper. With that comes a freedom to learn from what has come before without getting trapped in a local maximum with a digital system that works but creates more work for practitioners.</p>\n<p>Dr. Gawande&#39;s insights have been instrumental to us as we hope to bring a fresh perspective how a medical records system can <em>reduce</em> overwhelm and workload, allowing health workers to get back to what they care about: their patients.</p>\n<p>Here are some key takeaways and how our system’s calm, elegant, human-centered design speaks to the frustrations health workers have with many of today’s leading systems.</p>\n<h2>Drowning in the inbox: when everything is urgent, nothing is</h2>\n<p>Health workers have limited time and when their inboxes grow faster than they can be managed, they are likely to just give up and declare notification bankruptcy. Dr. Gawande quotes Dr. Susan Sadoughi, a primary-care physician with twenty-four years experience, “I can’t read ninety per cent of [the messages]. So I glance at the patient’s name, and, if it’s someone that I was worried about, I’ll read that.” She deletes the rest, unread.</p>\n<p>Similarly, a patient’s “Problem List”, which is intended to be a list of their active conditions, is frequently inundated with irrelevant notes filling up a “Hogwarts Castle replica with servers” as Youtuber <a href="https://www.youtube.com/watch?v=LDJvS8Iz4a8">Dr. Dlaucomflecken satirizes</a>. This list either needs to be cleaned up leading to more work or is left to balloon becoming less useful to other health workers over a patient’s lifetime.</p>\n<p>At Virtual Hospitals Africa we address this in a number of ways. First, our system leverages the <a href="https://emssa.org.za/wp-content/uploads/2011/04/SATS-Manual-A5-LR-spreads.pdf">South African Triage Scale</a> with specific prioritization levels corresponding to precise target times for treatment:</p>\n<ul>\n<li><span style="color: #dc2626; font-weight: 600;">Emergency</span> = Immediate</li>\n<li><span style="color: #ea580c; font-weight: 600;">Very Urgent</span> = Within 10 minutes</li>\n<li><span style="color: #ca8a04; font-weight: 600;">Urgent</span> = Within one hour</li>\n<li><span style="color: #16a34a; font-weight: 600;">Non urgent</span> = Within four hours</li>\n</ul>\n<p>The system automatically assigns priorities based on rules-based logic regarding the patient’s warning &amp; vital signs, e.g. Chest pain = Very Urgent. These priorities are displayed prominently throughout the interface and patients with more serious conditions are sorted ahead of others in the waiting room and inbox queue, ensuring the most pressing cases are handled first. This reduces stress by clearly delineating between cases that actually require urgent attention and those that can be handled when the patient is in front of you.</p>\n<div class="md:grid md:grid-cols-2 md:gap-8 md:items-center"><p>Additionally, messaging on our platform is human-to-human and record-contextual leading to less frequent, but more precise conversations. When clicked, any patient record displays a panel view with all other associated records shown together so that a diagnosis appears alongside its findings, lab results, and documents, themselves clickable records. Along with this, health workers also have the ability to send a message pertaining to this specific record so the recipient sees this finding in the subject line and with the same panel interface. This saves the recipient time as they need not scramble for past records and yields a more focused dialogue within a patient’s care team.</p>\n<figure>\n    <img src="/blog/images/how-health-workers-can-love-their-devices/image.png">\n    <figcaption>Messaging a fellow health worker based on a record</figcaption>\n</figure></div><h2>Note bloat: a syndrome by any other name</h2>\n<p>Medical records systems like Epic primarily save medical notes as free-form text. While this is a conceptually simple model that was innovative when MUMPS, the programming language on which it is based, <a href="https://www.youtube.com/watch?v=7g1K-tLEATw">was created in the 1967</a> it does not enforce consistency or brevity at the record level. This can lead to notes getting out of control quickly. “Three people will list the same diagnosis three different ways. Or an orthopedist will list the same generic symptom for every patient (“pain in leg”), which is sufficient for billing purposes but not useful to colleagues who need to know the specific diagnosis (e.g., “osteoarthritis in the right knee”),” says Dr. Sadoughi. According to Dr. Gawande, doctors will “paste in whole blocks of information—an entire two-page imaging report, say—rather than selecting the relevant details. The next doctor must hunt through several pages to find what really matters. Multiply that by twenty-some patients a day, and you can see Sadoughi’s problem.”</p>\n<p>Instead of arbitrary text, Virtual Hospitals Africa’s database saves every record as a precise medical concept with specific <a href="https://www.nlm.nih.gov/healthit/snomedct/index.html">SNOMED</a> codes. While health workers can search for and find a medical concept by one of its aliases, e.g., adrenaline for norepinephrine, the system will record a single code for the concept and use its canonical name throughout the interface.</p>\n<div class="md:grid md:grid-cols-2 md:gap-8 md:items-center"><figure>\n    <img src="/blog/images/how-health-workers-can-love-their-devices/image1.png">\n    <figcaption>With SNOMED, a medical concept has concrete relationships to other concepts</figcaption>\n</figure><p>This technology goes deeper than just enforcing consistency and brevity as SNOMED’s ontology also encodes relationships between various concepts. So if someone has “Houssay’s syndrome” our system can know that this is a subtype of Diabetes mellitus and is a pituitary gland disorder. These relationships feed into our system’s rules-based engine so that nurses are prompted to perform additional tasks and investigations based on finding site or other attributes, saving the doctor having to place those orders themselves.</p>\n</div><p>To support notes of arbitrary complexity, records can further qualify or relate to other records. So a finding of “Itching” can be qualified as “Sudden onset” which will read in the interface as “Sudden onset itching”. Similarly, “Diagnosis of breast cancer” can be related to “Neoplasm” with “Finding site: left breast” and/or other findings used as evidence of the diagnosis. This allows for the same level of arbitrary depth as free-form text notes, but means that findings can be displayed in a quickly scannable format and more easily found by both the computer and the human using it.</p>\n<h2>Too many clicks: of course I’m me!</h2>\n<p>Dr. Sadoughi laments, “When I do a Pap smear, I have eleven clicks. It’s ‘Oh, who did it?’ Why not, by default, think that I did it?” She was almost shouting now. “I’m the one putting the order in. Why is it asking me what date, if the patient is in the office today? When do you think this actually happened? It is incredible!”</p>\n<p>When using Virtual Hospitals Africa, health workers use a patient-focused view for this specific encounter, free of distractions. Within this interface any findings you enter are recorded as being made by you at the time you recorded them. These sane defaults allow for an uncluttered interface with simple checkboxes (we’re believers in Dr. Gawande’s book <a href="https://atulgawande.com/book/the-checklist-manifesto/">The Checklist Manifesto</a>). The result is that the most common findings can often be made with one click.</p>\n<figure>\n  <img src="/blog/images/how-health-workers-can-love-their-devices/image2.png">\n    <figcaption>The warning signs view allows for rapid entry of the most urgent and most common symptoms.</figcaption>\n</figure><h2>Work Silos: I’m afraid you can’t do that</h2>\n<p>Many systems are bureaucratic, preventing people who could help doctors, specialists, and other senior staff from doing so. Dr. Gawande notes that prior to digitization Jessica Jacobs, an office assistant in his practice, ”sorted the patient records before clinic, drafted letters to patients, prepped routine prescriptions—all tasks that lightened the doctors’ load. None of this was possible anymore…office assistants have different screens and are not trained or authorized to use the ones doctors have.”</p>\n<p>With Virtual Hospitals Africa we have a single application that’s designed to be used by all health workers: not only doctors and nurses, but also pharmacists, lab technicians, receptionists, and emergency workers. Our system distinguishes between evaluations (inferences based on findings) and procedures (actions performed) with only the latter requiring a particular licensure from known regulatory agencies. In practice, that means that a health workers can add their own evaluations for  sign off by someone with a higher permissions level such as a nurse writing a prescription and sent off to a doctor to be finalized.</p>\n<h2>Scribing: AI to the rescue?</h2>\n<p>Dr. Gawande notes the utility of having a scribe record notes to lighten doctors’ workload. In 2026, many hospitals are turning to AI (have you heard of it?) to support this transcription effort. Initial results suggests <a href="https://jamanetwork.com/journals/jamanetworkopen/fullarticle/2837847?utm_source=For_The_Media&utm_medium=referral&utm_campaign=ftm_links&utm_term=082125">ambient documentation technology can indeed reduce clinical burden and burnout from documentation</a>. However a <a href="https://pmc.ncbi.nlm.nih.gov/articles/PMC12220090/">meta-analysis</a> indicates that there are still concerns regarding transcription accuracy especially in accented language.</p>\n<p>For Virtual Hospitals Africa we are excited at the prospect of transcription technology to reduce clinical workload and believe that when combined with many of the above techniques can yield the best possible user experience without an increase in transcription errors. By using well-defined clinical processes starting at the clinic, our system can have a dictionary of words that are more likely to be spoken on a given webpage making the transcription process more likely “hear” certain concepts the clinician. So when a nurse doing triage is measuring the patient’s vitals, the system can interpret “120 over 80” as 120 mmHg systolic blood pressure and 80 mmHg diastolic blood pressure. Indeed, <a href="https://drivendata.co/blog/snomed-ct-entity-linking-challenge-winners">dictionary-based approaches fared better in entity linking than leading LLMs</a> so this can both lead to lower error rates while also leading to more focused notes downstream. This could be combined with open source models that can <a href="https://huggingface.co/itskamo-com/whisper-small-sepedi-v2">transcribe</a> and translate to support South Africa’s 12 official languages and more as we grow.</p>\n<h2>Saving work for those who are saving lives</h2>\n<p>We are grateful to Dr. Gawande for outlining the many ways in which we can improve on existing digital tools in ways that reduce the burden of managing messages, notes, and streamline clinical processes. We believe that if our computers can give health workers time back in efficiency without demanding more from them they can indeed love their computers.</p>\n',
  },
]

const POSTS_BY_SLUG = new Map(BLOG_POSTS.map((post) => [post.slug, post]))

export default function BlogPostPage(ctx: Context<unknown>) {
  const { post: slug } = ctx.params
  const post = POSTS_BY_SLUG.get(slug)

  if (!post) {
    return ctx.render(<div>Post not found</div>, { status: 404 })
  }

  const other_posts = BLOG_POSTS.filter((p) => p.slug !== slug)

  // deno-lint-ignore react-no-danger
  const html_content = <div dangerouslySetInnerHTML={{ __html: post.html }} />

  return (
    <LayoutBlogPost
      title={post.title}
      subtitle={post.subtitle}
      author={post.author}
      date={post.date}
      tags={post.tags}
      word_count={post.word_count}
      hero_image={post.hero_image}
      wide_image={post.wide_image}
      other_posts={other_posts}
    >
      {html_content}
    </LayoutBlogPost>
  )
}
