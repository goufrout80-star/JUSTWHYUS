import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'

export interface FeedbackItem {
  id: string
  user_email: string
  user_name: string
  page_url: string
  section_label: string
  note: string
  status: 'new' | 'reviewed' | 'resolved'
  created_at: string
}

export function useFeedback(userEmail: string | null) {
  const [items, setItems] = useState<FeedbackItem[]>([])
  const [loading, setLoading] = useState(true)

  const fetchFeedback = useCallback(async () => {
    setLoading(true)
    const q = supabase
      .from('feedback')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(200)

    // If userEmail supplied, only fetch that user's feedback
    if (userEmail) q.eq('user_email', userEmail)

    const { data } = await q
    if (data) setItems(data as FeedbackItem[])
    setLoading(false)
  }, [userEmail])

  useEffect(() => {
    fetchFeedback()
  }, [fetchFeedback])

  // Realtime
  useEffect(() => {
    const channel = supabase
      .channel('feedback_rt')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'feedback' },
        () => fetchFeedback(),
      )
      .subscribe()
    return () => { supabase.removeChannel(channel) }
  }, [fetchFeedback])

  const sendFeedback = async (
    userEmail: string,
    userName: string,
    pageUrl: string,
    sectionLabel: string,
    note: string,
  ) => {
    const { error } = await supabase.from('feedback').insert({
      user_email: userEmail,
      user_name: userName,
      page_url: pageUrl,
      section_label: sectionLabel,
      note,
    })
    if (!error) await fetchFeedback()
    return { error }
  }

  const updateStatus = async (id: string, status: FeedbackItem['status']) => {
    const { error } = await supabase
      .from('feedback')
      .update({ status })
      .eq('id', id)
    if (!error) await fetchFeedback()
    return { error }
  }

  return { items, loading, sendFeedback, updateStatus, refetch: fetchFeedback }
}
