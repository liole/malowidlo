
export function applyMask(word, mask = '_') {
    return word.replace(/\p{L}/uig, mask);
}

export function findLast(array, predicate) {
    for (var index = array.length - 1; index >= 0; index--) {
        if (predicate(array[index])) {
            return array[index];
        }
    }
}
