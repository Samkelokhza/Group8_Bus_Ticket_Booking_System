import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import api from '../api/axios'

export function useBookings() {
  const queryClient = useQueryClient()

  const bookings = useQuery({
    queryKey: ['bookings'],
    queryFn: () => api.get('/bookings/').then(res => res.data),
  })

  const createBooking = useMutation({
    mutationFn: (data) => api.post('/bookings/', data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['bookings'] }),
  })

  return { bookings, createBooking }
}