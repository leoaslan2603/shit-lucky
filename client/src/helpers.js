const colors = [
    'text-red-500',
    'text-yellow-500',
    'text-green-500',
    'text-blue-500',
    'text-indigo-500',
    'text-purple-500',
    'text-pink-500',
]

export const randomColor = () => {
    return colors[Math.floor(Math.random() * colors.length)]
}

export const uniqueId = () => {
    return Math.floor(Math.random() * Date.now())
}

export const serialize = (obj) => {
    let str = []

    for (let p in obj) {
        if (obj.hasOwnProperty(p)) {
            str.push(encodeURIComponent(p) + '=' + encodeURIComponent(obj[p]))
        }
    }

    return str.join('&')
}
