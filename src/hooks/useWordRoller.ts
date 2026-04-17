import { useState, useEffect } from 'react'

const WORDS = [
  'EXECUTE',
  'CONTROL',
  'DELIVER',
  'OPERATE',
  'CURATE',
  'QUALIFY',
  'BRIEF',
  'SCALE',
  'SELECT',
  'DEPLOY',
]

export function useWordRoller(interval = 4000) {
  const [index, setIndex] = useState(0)

  useEffect(() => {
    const timer = setInterval(() => {
      setIndex(prev => (prev + 1) % WORDS.length)
    }, interval)
    return () => clearInterval(timer)
  }, [interval])

  const getVisible = () => {
    return [-1, 0, 1, 2].map(offset => {
      const i = (index + offset + WORDS.length) % WORDS.length
      return { word: WORDS[i], isActive: offset === 0 }
    })
  }

  return { visibleWords: getVisible(), index }
}
