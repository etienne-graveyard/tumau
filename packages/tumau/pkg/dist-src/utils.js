export function notNill(maybe) {
    if (maybe === null || maybe === undefined) {
        throw Error(`Unexpected nill`);
    }
    return maybe;
}
