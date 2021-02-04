
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

export function applyTransform(p, t) {
    return addVectors(multMatrixVector(t.a, p), t.b);
}

export function extractTransformScale(t) {
    return getVectorLength(multMatrixVector(t.a, { x: 1, y: 0 }));
}

export function applyTransformAll(pts, t) {
    return pts.map(p => applyTransform(p, t));
}

export function getVector(p1, p2) {
    return {
        x: p2.x - p1.x,
        y: p2.y - p1.y
    };
}

export function dotProduct(v1, v2) {
    return v1.x * v2.x + v1.y * v2.y;
}

export function crossProduct(v1, v2) {
    return v1.x * v2.y - v1.y * v2.x;
}

export function multVector(v, k) {
    return {
        x: v.x * k,
        y: v.y * k
    };
}

export function getVectorLength(v) {
    return Math.sqrt(dotProduct(v, v));
}

export function getAngle(v1, v2) {
    return Math.atan2(crossProduct(v1, v2), dotProduct(v1, v2));
}

export function getTransformMatrix(v1, v2) {
    var ang = getAngle(v1, v2);
    var scale = getVectorLength(v2) / getVectorLength(v1);
    return [
        [scale * Math.cos(ang), - Math.sin(ang)],
        [Math.sin(ang), scale * Math.cos(ang)]
    ];
}

export function multMatrixVector(m, v) {
    return {
        x: m[0][0] * v.x + m[0][1] * v.y,
        y: m[1][0] * v.x + m[1][1] * v.y
    };
}

export function multMatrix(m, k) {
    return [
        [m[0][0] * k, m[0][1]],
        [m[1][0], m[1][1] * k]
    ];
}

export function addVectors(v1, v2) {
    return {
        x: v1.x + v2.x,
        y: v1.y + v2.y
    };
}

export function getTransformObject(pFrom, pTo) {
    var v1 = getVector(...pFrom);
    var v2 = getVector(...pTo);
    var a = getTransformMatrix(v1, v2);
    var p1 = addVectors(...pFrom);
    var p2 = addVectors(...pTo);
    var b = multVector(addVectors(p2, multVector(multMatrixVector(a, p1), -1)), 1/2);
    return { a, b };
}
