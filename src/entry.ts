// import '../env'
// import * as fs from 'fs'
// import * as path from 'path'
// import * as http from 'http'
// import * as https from 'https'
// import { createServer } from './server'
// import db from './db'
// import { createResponder } from './responder'
// import { createTokenRefresher } from './tokenRefresher'

// const port = Number(process.env.PORT) || 5004

// const server = createServer()

// const httpServer = process.env.NODE_ENV === 'production'
//   ? http.createServer(server.callback())
//   : https.createServer(
//     {
//       key: fs.readFileSync(path.join(__dirname, '..', 'certs', 'localhost.key'), 'utf8').toString(),
//       cert: fs.readFileSync(path.join(__dirname, '..', 'certs', 'localhost.crt'), 'utf8').toString(),
//     },
//     server.callback()
//   )

// const responder = createResponder()
// const tokenRefresher = createTokenRefresher()

// // TODO: Migrate before starting server
// db.migrate.latest().then(() => {
//   console.log('Migrations run')

//   responder.start()
//   tokenRefresher.start()
// })

// httpServer.listen(port, () =>
//   console.log(`hgat-whatsapp-poc-server listening on ${port} ${new Date()}`))

// process.on('beforeExit', () => {
//   responder.exit()
//   tokenRefresher.exit()
// })
