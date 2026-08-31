import { useEffect, useRef, useState } from 'react'

const DEFAULT_SPEED_MS = 18

function useTypewriter(text, { skip = false, speed = DEFAULT_SPEED_MS, onDone } = {}) {
    const [visibleLength, setVisibleLength] = useState(skip ? text.length : 0)
    const [isDone, setIsDone] = useState(skip)
    const onDoneRef = useRef(onDone)
    onDoneRef.current = onDone

    useEffect(() => {
        if (skip) {
            setVisibleLength(text.length)
            setIsDone(true)
            return
        }

        setVisibleLength(0)
        setIsDone(false)

        let currentLength = 0

        const intervalId = setInterval(() => {
            currentLength += 1
            setVisibleLength(currentLength)

            if (currentLength >= text.length) {
                clearInterval(intervalId)
                setIsDone(true)
                onDoneRef.current?.()
            }
        }, speed)

        return () => clearInterval(intervalId)
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [text, skip, speed])

    return {
        visibleText: text.slice(0, visibleLength),
        isDone,
    }
}

export default useTypewriter
