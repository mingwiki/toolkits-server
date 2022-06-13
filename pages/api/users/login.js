import SQL from '../../../db'
import CryptoJS from 'crypto-js'
const datetime = require('moment')().format('YYYY-MM-DD HH:mm:ss')

export default async (req, res) => {
  try {
    let result
    res.setHeader('Access-Control-Allow-Origin', '*')
    res.setHeader('Access-Control-Allow-Methods', '*')
    res.setHeader('Access-Control-Allow-Headers', '*')
    res.setHeader('Access-Control-Allow-Credentials', true)
    if (req.method === 'POST') {
      const { filter } = req.body
      const session_id = CryptoJS.SHA256(
        Object.entries(filter)
          .flatMap((e) => `${e[0]}='${e[1]}'`)
          .concat([new Date().toLocaleString()])
          .join('-')
      ).toString(CryptoJS.enc.Hex)
      const update = await SQL(
        `UPDATE users SET update_time = '${datetime}', session_id ='${session_id}'` +
          (Object.keys(filter)?.length
            ? ` WHERE ${Object.entries(filter)
                .flatMap((e) => `${e[0]}='${e[1]}'`)
                .join(' AND ')}`
            : null)
      )
      console.log(update)
      if (update.warningCount === 0) {
        result = await SQL(
          `SELECT id, username, nickname, update_time, create_time FROM users` +
            (Object.keys(filter)?.length
              ? ` WHERE ${Object.entries(filter)
                  .flatMap((e) => `${e[0]}='${e[1]}'`)
                  .join(' AND ')}`
              : null)
        )
        res.setHeader(
          'Set-Cookie',
          `session_id=${session_id}; max-age=86400; path=/;`
        )
        res.status(200).json(result)
      } else {
        res.status(200).json('帐户不存在或密码不匹配')
      }
    } else {
      res.status(200).json('Not POST request')
    }
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}