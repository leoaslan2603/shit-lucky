import { useSelector } from 'react-redux'
import { getPlayers, getUser } from '../store'
import { Swiper, SwiperSlide } from 'swiper/react'
import 'swiper/swiper-bundle.css'
import { randomColor } from '../helpers'

const Players = () => {
    const players = useSelector(getPlayers)
    const user = useSelector(getUser)

    const slider = {
        slidesPerView: 8,
        freeMode: true,
        lazy: true,
    }

    return (
        <div className="mt-8">
            <Swiper key={'players-' + Object.keys(players).length} {...slider}>
                {
                    Object.values(players).map((player, index) => (
                        <SwiperSlide key={index} className="cursor-pointer my-2 flex flex-col items-center text-center">
                            <img className="rounded-full w-16 h-16 ring-2 ring-yellow-500" src={player.avatar} alt={player.name} />

                            <span className={'mt-2 font-bold ' + (player.color || randomColor())}>
                                {player.id === user.id ? 'You' : player.name}
                            </span>
                        </SwiperSlide>
                    ))
                }
            </Swiper>
        </div>
    )
}

export default Players
