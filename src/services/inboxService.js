import { supabase } from '../lib/supabaseClient'

export async function getAllInboxes() {
    const { data, error } = await supabase
        .from('inbox')
        .select('*')
        .order('created_at', { ascending: false })

    if (error) {
        throw error
    }

    return data
}

export async function getUserInboxes(userId) {
    const { data, error } = await supabase
        .from('inbox')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', {
            ascending: false,
        })

    if (error) {
        throw error
    }

    return data
}

export async function createInbox(userId, title, message) {
    const { data: inbox, error: inboxError } = await supabase
        .from('inbox')
        .insert({
            user_id: userId,
            title: title,
        })
        .select()
        .single()

    if (inboxError) {
        throw inboxError
    }

    const { error: messageError } = await supabase
        .from('inbox_messages')
        .insert({
            inbox_id: inbox.id,
            user_id: userId,
            message: message,
        })

    if (messageError) {
        throw messageError
    }

    return inbox
}

export async function getInboxMessages(inboxId) {
    console.log('GET MESSAGES FOR INBOX:', inboxId)

    const { data, error } = await supabase
        .from('inbox_messages')
        .select('*')
        .eq('inbox_id', inboxId)
        .order('created_at', {
            ascending: true,
        })

    console.log('MESSAGES DATA:', data)
    console.log('MESSAGES ERROR:', error)

    if (error) {
        throw error
    }

    return data
}

export async function sendInboxMessage(
    inboxId,
    userId,
    message
) {
    const { data, error } = await supabase
        .from('inbox_messages')
        .insert({
            inbox_id: inboxId,
            user_id: userId,
            message,
        })
        .select()
        .single()

    if (error) {
        throw error
    }

    return data
}