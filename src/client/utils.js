
export function applyMask(word, mask = '_') {
    return word.replace(/\p{L}/uig, mask);
}

export function randomChar() {
    return String.fromCharCode('a'.charCodeAt(0) + Math.random()*26)
}

export function findLast(array, predicate, upTo = array.length - 1) {
    for (var index = upTo; index >= 0; index--) {
        if (predicate(array[index])) {
            return array[index];
        }
    }
}

export function levDist(a, b) {
    var prev = Array.from({ length: b.length + 1 }, (_, i) => i);
    var curr = Array.from({ length: b.length + 1 }, _ => 0);

    for (var i = 0; i < a.length; ++i) {
        curr[0] = i + 1;
        for (var j = 0; j < b.length; ++j) {
            curr[j + 1] = Math.min(prev[j + 1] + 1, curr[j] + 1, prev[j] + (a[i] != b[j]));
        }
        prev = [...curr];
    }
    return curr[b.length];
}
