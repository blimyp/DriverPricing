import { supabase } from "../lib/supabaseClient"

export async function getRoute({
    origin,
    destination,
    stops,
}) {
    const { data, error } = await supabase.functions.invoke(
        'get-route',
        {
            body: {
                origin,
                destination,
                stops,
            },
        }
    )

    if (error) {
        throw error
    }

    return data
}