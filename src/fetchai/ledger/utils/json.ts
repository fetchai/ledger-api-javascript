const validJSONObject = (s: unknown): boolean =>
{
    try {
        JSON.stringify(s)
        return true;
    } catch {
 return false;
    }
}

export {validJSONObject}
