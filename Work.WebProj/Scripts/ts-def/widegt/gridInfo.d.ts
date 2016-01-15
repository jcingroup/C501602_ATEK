declare module widegt {
    interface GridInfo {
        total: number;
        page: number;
        records: number;
        startcount: number;
        endcount: number;
        rows: any[];
    }

    interface GridInfoT<T> {
        total: number;
        page: number;
        records: number;
        startcount: number;
        endcount: number;
        rows: Array<T>;
    }
}
