import { FileCreateData } from './types'
import { posix } from 'path'
import { promises } from 'fs'
import * as mime from 'mime'

const { parse } = posix
const { readFile } = promises

export const diskFileToCreateData = async (
  diskPath: string, tags: string[] = []
) => {
  const { base: originalname } = parse( diskPath )
  const buffer = await readFile( diskPath )
  const mimetype = mime.getType( originalname ) || 'application/octet-stream'
  const { byteLength: size } = buffer

  const fileData: FileCreateData = {
    originalname, buffer, mimetype, size, tags
  }

  return fileData
}

