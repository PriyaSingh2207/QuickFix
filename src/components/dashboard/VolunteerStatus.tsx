import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useVolunteers } from "@/hooks/use-volunteers";

export function VolunteerStatus() {
    const { data: volunteers, isLoading } = useVolunteers();

    if (isLoading) {
        return (
            <Card className="h-full">
                <CardHeader><CardTitle>Loading...</CardTitle></CardHeader>
            </Card>
        )
    }

    const availableCount = volunteers?.filter(v => v.status === 'available').length || 0;
    const onTaskCount = volunteers?.filter(v => v.status === 'on-task').length || 0;
    const totalCount = volunteers?.length || 0;

    return (
        <Card className="h-full">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-lg">Volunteer Status</CardTitle>
                <div className="flex gap-1">
                    <span className="flex h-2 w-2 rounded-full bg-emerald-500"></span>
                    <span className="flex h-2 w-2 rounded-full bg-amber-500"></span>
                    <span className="flex h-2 w-2 rounded-full bg-slate-300"></span>
                </div>
            </CardHeader>
            <CardContent className="space-y-4">
                {/* Summary Stats */}
                <div className="grid grid-cols-3 gap-2 mb-4">
                    <div className="bg-emerald-50 p-2 rounded text-center border border-emerald-100">
                        <div className="text-lg font-bold text-emerald-700">{availableCount}</div>
                        <div className="text-[10px] text-emerald-600 uppercase font-bold">Available</div>
                    </div>
                    <div className="bg-amber-50 p-2 rounded text-center border border-amber-100">
                        <div className="text-lg font-bold text-amber-700">{onTaskCount}</div>
                        <div className="text-[10px] text-amber-600 uppercase font-bold">On Task</div>
                    </div>
                    <div className="bg-slate-50 p-2 rounded text-center border border-slate-100">
                        <div className="text-lg font-bold text-slate-700">{totalCount}</div>
                        <div className="text-[10px] text-slate-600 uppercase font-bold">Total</div>
                    </div>
                </div>

                {/* List */}
                <div className="space-y-3">
                    {volunteers?.map(v => (
                        <div key={v.id} className="flex items-center justify-between p-2 hover:bg-muted/50 rounded-lg transition-colors cursor-pointer">
                            <div className="flex items-center gap-3">
                                <div className="h-8 w-8 rounded-full bg-slate-200 flex items-center justify-center text-xs font-bold text-slate-600">
                                    {v.name.charAt(0)}
                                </div>
                                <div>
                                    <p className="text-sm font-medium leading-none">{v.name}</p>
                                    <p className="text-xs text-muted-foreground mt-1">{v.role}</p>
                                </div>
                            </div>
                            <Badge variant={v.status === 'available' ? 'default' : v.status === 'on-task' ? 'secondary' : 'outline'} className={v.status === 'available' ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200 border-emerald-200' : v.status === 'on-task' ? 'bg-amber-100 text-amber-700 hover:bg-amber-200 border-amber-200' : 'text-slate-500'}>
                                {v.status}
                            </Badge>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    )
}
