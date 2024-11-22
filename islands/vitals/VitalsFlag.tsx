import { useState } from 'preact/hooks'
import { FlagIcon } from '../../components/library/icons/heroicons/solid.tsx'
import { Button } from '../../components/library/Button.tsx'

export default function VitalsFlag(
    props: {
        className: string
    }
) {
    const [flag, setFlag] = useState(false)

    return (
        <div className={props.className}>
            <button type='button' onClick={() => setFlag(!flag)} onSubmit={() => setFlag(!flag)}>
                {
                    flag ?
                    <FlagIcon
                        className='h-5 w-5 text-red-400'
                        aria-hidden='true'
                    /> :
                    <FlagIcon
                        className='h-5 w-5 text-gray-400 fill-black'
                        aria-hidden='true'
                    />
                }
            </button>
        </div>
    )
}