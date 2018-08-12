#!/usr/bin/env ts-node

// tslint:disable:no-shadowed-variable
import test from 'blue-tape'

import {
  AWS_SETTING,
}                 from '../tests/fixtures'

import {
  MemoryCard,
}                           from './memory-card'
import {
  StorageBackendOptions,
}                           from './storage'

test('smoke testing', async t => {
  const card = new MemoryCard()
  await card.load()

  t.equal(await card.size, 0, 'init with 0')

  await card.set('a', 'b')
  t.equal(await card.size, 1, 'size with 1')

  t.equal(await card.get('a'), 'b', 'get key a with value b')

  await card.clear()
  t.equal(await card.size, 0, 'clear reset to 0')
})

test('storage file load/save', async t => {
  const EXPECTED_KEY = 'key'
  const EXPECTED_VAL = 'val'
  const NAME = Math.random().toString().substr(2)

  const card = new MemoryCard({
    name: NAME,
    storageOptions: {
      type: 'file',
    }
  })
  await card.load()

  await card.set(EXPECTED_KEY, EXPECTED_VAL)
  await card.save()

  const cardB = new MemoryCard({
    name: NAME,
    storageOptions: {
      type: 'file',
    }
  })
  await cardB.load()

  t.equal(await cardB.get(EXPECTED_KEY), EXPECTED_VAL, 'should get val back from file')

  await card.destroy()
  await cardB.destroy()
})

test('storage aws s3 load/save', async t => {
  const EXPECTED_KEY = 'key'
  const EXPECTED_VAL = 'val'
  const NAME         = Math.random().toString().substr(2)

  const storageOptions = {
    accessKeyId     : AWS_SETTING.ACCESS_KEY_ID,
    bucket          : AWS_SETTING.BUCKET,
    region          : AWS_SETTING.REGION,
    secretAccessKey : AWS_SETTING.SECRET_ACCESS_KEY,
    type            : 's3',
  } as StorageBackendOptions

  const card = new MemoryCard({
    name: NAME,
    storageOptions,
  })
  await card.load()

  await card.set(EXPECTED_KEY, EXPECTED_VAL)
  await card.save()

  const cardB = new MemoryCard({
    name: NAME,
    storageOptions,
  })
  await cardB.load()

  t.equal(await cardB.get(EXPECTED_KEY), EXPECTED_VAL, 'should get val back from s3')

  await card.destroy()
  await cardB.destroy()
})

test('save() throw exception before load()', async t => {
  const NAME = Math.random().toString().substr(2)

  const card = new MemoryCard({
    name: NAME,
    storageOptions: {
      type: 'file',
    }
  })

  try {
    await card.save()
    t.fail('should not call save() success')
  } catch (e) {
    t.pass('should throw to call save() before load()')
  }
})

test('load() twice should throw error', async t => {
  const NAME = Math.random().toString().substr(2)

  const card = new MemoryCard({
    name: NAME,
    storageOptions: {
      type: 'file',
    }
  })

  try {
    await card.load()
    await card.load()
    t.fail('should not call load() success after twice')
  } catch (e) {
    t.pass('should throw to call load() twice')
  }
})

// test('options should allow name with Symbol', async t => {
//   const NAME = Symbol('name')

//   const card = new MemoryCard({
//     name: NAME,
//     storageOptions: {
//       type: 'file',
//     }
//   })

//   t.equal(card.name, NAME, 'should equal to the symbol name')
// })
