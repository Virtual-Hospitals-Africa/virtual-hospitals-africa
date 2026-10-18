import type { CommentObjectResponse, PageObjectResponse } from '@notionhq/client'
import { describe, it } from 'std/testing/bdd.ts'
import { assert } from 'std/assert/assert.ts'
import { assertEquals } from 'std/assert/assert_equals.ts'
import { assertMatch } from 'std/assert/assert_match.ts'
import { assertStringIncludes } from 'std/assert/assert_string_includes.ts'
import { assertThrows } from 'std/assert/assert_throws.ts'

import {
  type BlockNode,
  BOT_CARDS_FILTER,
  BOT_PROPERTIES,
  cardDocument,
  cardOf,
  fieldsOver,
  markdownOf,
  propertiesOf,
  propertyGaps,
  repliesSince,
} from '../../../bot/notionModel.ts'

function assertThrowsMatching(fn: () => unknown, pattern: RegExp) {
  const error = assertThrows(fn)
  assert(error instanceof Error)
  assertMatch(error.message, pattern)
}

// Synthetic, shaped to @notionhq/client's response types; re-record from the live API once the
// integration exists (docs/bot.md).
const fixture = (name: string) => JSON.parse(Deno.readTextFileSync(new URL(`./fixtures/${name}`, import.meta.url)))

const page: PageObjectResponse = fixture('page.json')
const comments: CommentObjectResponse[] = fixture('comments.json')
const bot_author: string = fixture('meta.json').botUserId

describe('cardOf', () => {
  it('reads the bot properties', () => {
    assertEquals(cardOf(page), {
      id: page.id,
      url: page.url,
      title: 'Fix join link on Android',
      status: 'In progress',
      botState: 'Waiting on you',
      session: 'sess-1',
      worktree: 'bot_fix_join_link_on_android_5f0a',
      lastComment: '2026-10-06T09:00:00.000Z',
      pr: null,
      hold: false,
      priority: 'High',
      created: '2026-10-01T12:00:00.000Z',
    })
  })

  it('reads the title from the title property whatever it is called, and ignores the URL property', () => {
    const { Name: title, ...rest } = page.properties
    assertEquals(cardOf({ ...page, properties: { 'Task name': title, ...rest } }).title, 'Fix join link on Android')
    assertEquals(cardOf(page).url, 'https://www.notion.so/5f0a7c214b6e4d3a9c182e7d90b1a3c4')
  })

  it('ranks Postponed, or a card with no Priority, like no priority', () => {
    const priority = (select: unknown) =>
      cardOf({ ...page, properties: { ...page.properties, Priority: { id: 'p', type: 'select', select } } as never }).priority
    assertEquals(priority({ id: 'y', name: 'Postponed', color: 'gray' }), null)
    assertEquals(priority(null), null)
  })

  it('refuses a card without a Status', () => {
    const { Status: _status, ...rest } = page.properties
    assertThrowsMatching(() => cardOf({ ...page, properties: rest }), /Status/)
  })
})

describe('repliesSince', () => {
  it('drops the bot’s own comments', () => {
    assertEquals(repliesSince(comments, null, bot_author).map((r) => r.id), ['c2', 'c3'])
  })

  it('keeps only comments from the boundary on, oldest first', () => {
    assertEquals(repliesSince(comments, '2026-10-06T10:30:00.000Z', 'nobody').map((r) => r.id), ['c3'])
  })

  it('keeps a reply in the boundary minute (Notion rounds comment times), whatever the offset format', () => {
    assertEquals(repliesSince(comments, '2026-10-06T11:00:00.000Z', bot_author).map((r) => r.id), ['c3'])
    assertEquals(repliesSince(comments, '2026-10-06T11:00:00.000+00:00', bot_author).map((r) => r.id), ['c3'])
  })

  it('names the author and lists attachments', () => {
    const [blue] = repliesSince(comments, null, bot_author)
    assertEquals(blue.author, 'Sam')
    assertEquals(blue.text, 'Blue, like this:')
    assertEquals(blue.files, [{ name: '1-image', url: 'https://files.notion.so/banner.png' }])
  })
})

describe('markdownOf', () => {
  it('renders the page body', () => {
    const blocks: BlockNode[] = fixture('blocks.json')
    assertEquals(
      markdownOf(blocks),
      [
        '## What happens',
        'The join link [404s](https://vha.example/join)',
        '- Android',
        '  - [x] Pixel 8',
        '```shell\nadb logcat\n```',
        '![image](https://files.notion.so/shot.png)',
        '[table_of_contents block]',
      ].join('\n'),
    )
  })
})

describe('BOT_CARDS_FILTER', () => {
  it('picks cards ticked for the bot, held ones too — no task type, no assignee', () => {
    assertEquals(BOT_CARDS_FILTER, { property: 'Bot', checkbox: { equals: true } })
    const filter = JSON.stringify(BOT_CARDS_FILTER)
    assert(!filter.includes('Bot hold'))
    assert(!filter.includes('Task type'))
    assert(!filter.includes('Assignee'))
  })
})

describe('cardDocument', () => {
  const card = cardOf(page)

  it('puts the card above its body', () => {
    assertEquals(
      cardDocument(card, '## What happens\nThe join link 404s'),
      [
        '# Fix join link on Android',
        '',
        '- Status: In progress',
        '- Priority: High',
        '- Link: https://www.notion.so/5f0a7c214b6e4d3a9c182e7d90b1a3c4',
        '',
        '## What happens',
        'The join link 404s',
        '',
      ].join('\n'),
    )
  })

  it('says so when the card is only a title', () => {
    for (const body of ['', '\n ']) {
      const document = cardDocument({ ...card, priority: null }, body)
      assertStringIncludes(document, '- Priority: unset')
      assertStringIncludes(document, '\n\n(The card has no description')
    }
  })
})

describe('propertyGaps', () => {
  it('names no select option with a comma, which Notion refuses', () => {
    for (const { options } of Object.values(BOT_PROPERTIES)) {
      for (const option of options ?? []) assert(!option.includes(','))
    }
  })

  const complete = Object.fromEntries(Object.entries(BOT_PROPERTIES).map(([name, { type }]) => [name, { type }]))

  it('finds nothing missing on a board that has every bot property', () => {
    assertEquals(propertyGaps({ ...complete, Status: { type: 'status' } }), { missing: [], wrongType: [] })
  })

  it('finds all seven bot properties missing on Tasks as VHA has it, and none of its own in the way', () => {
    const tasks = Object.fromEntries(
      [
        ['Name', 'title'],
        ['Status', 'status'],
        ['Assignee', 'people'],
        ['Deadline', 'date'],
        ['Priority', 'select'],
        ['Files & media', 'files'],
        ['Modules', 'relation'],
        ['Scenarios', 'formula'],
        ['URL', 'url'],
      ].map(
        ([name, type]) => [name, { type }],
      ),
    )
    assertEquals(propertyGaps(tasks), { missing: Object.keys(BOT_PROPERTIES), wrongType: [] })
    assertEquals(Object.keys(BOT_PROPERTIES), ['Bot', 'Bot hold', 'Bot state', 'Bot session', 'Worktree', 'Last comment', 'PR'])
  })

  it('lists missing properties and ones of the wrong type', () => {
    const { Bot: _bot, ...rest } = complete
    assertEquals(propertyGaps({ ...rest, PR: { type: 'rich_text' } }), {
      missing: ['Bot'],
      wrongType: [{ name: 'PR', expected: 'url', actual: 'rich_text' }],
    })
  })

  it('defines the nine Bot state options the lifecycle uses', () => {
    assertEquals(BOT_PROPERTIES['Bot state'].options, [
      'Queued',
      'Working',
      'Waiting on you',
      'Queued for test run',
      'Testing',
      'Awaiting CI',
      'Paused',
      'Blocked',
      'Finished',
    ])
  })
})

describe('propertiesOf', () => {
  it('maps each mirrored field onto its property', () => {
    assertEquals(
      propertiesOf({
        'Bot state': 'Working',
        Status: 'In progress',
        'Bot session': 's1',
        Worktree: 'bot_x',
        PR: 'https://pr',
        'Last comment': '2026-10-06T11:00:00.000Z',
        Bot: false,
      }),
      {
        'Bot state': { select: { name: 'Working' } },
        Status: { status: { name: 'In progress' } },
        'Bot session': { rich_text: [{ type: 'text', text: { content: 's1' } }] },
        Worktree: { rich_text: [{ type: 'text', text: { content: 'bot_x' } }] },
        PR: { url: 'https://pr' },
        'Last comment': { date: { start: '2026-10-06T11:00:00.000Z' } },
        Bot: { checkbox: false },
      },
    )
  })

  it('clears a field set to null', () => {
    assertEquals(propertiesOf({ Worktree: null, 'Bot state': null }), {
      Worktree: { rich_text: [] },
      'Bot state': { select: null },
    })
  })

  it('splits long text into the runs Notion accepts', () => {
    assertEquals(propertiesOf({ 'Bot session': 'x'.repeat(2001) })['Bot session'], {
      rich_text: [
        { type: 'text', text: { content: 'x'.repeat(2000) } },
        { type: 'text', text: { content: 'x' } },
      ],
    })
  })

  it('refuses a field the bot does not own, or a value of the wrong kind', () => {
    assertThrowsMatching(() => propertiesOf({ Assignee: 'x' }), /does not write Assignee/)
    assertThrowsMatching(() => propertiesOf({ Bot: 'yes' }), /true or false/)
    assertThrowsMatching(() => propertiesOf({ Status: true }), /takes text/)
  })
})

describe('fieldsOver', () => {
  const fields = { 'Bot state': 'Finished', Status: 'QA', PR: 'https://pr' }

  it('keeps a card in QA or Done where it is', () => {
    assertEquals(fieldsOver(fields, 'Done'), { 'Bot state': 'Finished', PR: 'https://pr' })
    assertEquals(fieldsOver({ Status: 'In progress' }, 'QA'), {})
  })

  it('moves a card from any other Status', () => {
    assertEquals(fieldsOver(fields, 'Not started'), fields)
    assertEquals(fieldsOver(fields, 'In progress'), fields)
  })
})
