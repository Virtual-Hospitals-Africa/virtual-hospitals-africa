/**
 * This is only in place to trip the auto-importer
 * by having at least one import of functions used
 * for testing/debugging that otherwise might not
 * get imported.
 */
import db from '../../db/db.ts'
import { debugLog } from '../../db/helpers.ts'
import { capture } from 'test/_helpers/capture.ts'

capture(null)
debugLog(db.selectNoFrom([]))
