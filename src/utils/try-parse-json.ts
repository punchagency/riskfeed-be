function TryParseJSON<T>(jsonString: string | null | object | any[], defaultValue: T): T {
    if (jsonString === null || jsonString === undefined) {
        return defaultValue;
    }
    if (typeof jsonString === 'object') {
        return jsonString as T;
    }
    if (typeof jsonString !== 'string') {
        return defaultValue;
    }

    const trimmedString = jsonString.trim();
    if (trimmedString === '') {
        return defaultValue;
    }

    try {
        const parsedResult = JSON.parse(trimmedString);
        if (parsedResult !== null && typeof parsedResult === 'object') {
            return parsedResult as T;
        }

        return defaultValue;
    } catch {
        return defaultValue;
    }
}

export default TryParseJSON;