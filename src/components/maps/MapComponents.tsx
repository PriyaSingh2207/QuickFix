// MapComponents disabled - Leaflet removed
// Empty placeholders to prevent import errors

export function LocationPicker(_props: any) {
    return (
        <div className="h-[300px] w-full rounded-lg overflow-hidden border border-slate-300 bg-slate-50 flex items-center justify-center">
            <p className="text-sm text-slate-500">Location picker temporarily unavailable</p>
        </div>
    );
}

export function CityMap(_props: any) {
    return (
        <div className="w-full rounded-lg overflow-hidden border border-slate-300 bg-slate-50 flex items-center justify-center p-8">
            <p className="text-sm text-slate-500">Map view temporarily unavailable</p>
        </div>
    );
}
