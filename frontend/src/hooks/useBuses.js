import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import api from '../api/axios'

export function useBuses() {
  const queryClient = useQueryClient()

  const buses = useQuery({
    queryKey: ['buses'],
    queryFn: () => api.get('/buses/').then(res => res.data),
  })

  const createBus = useMutation({
    mutationFn: (data) => api.post('/buses/', data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['buses'] }),
  })

  const updateBus = useMutation({
    mutationFn: ({ id, data }) => api.put(`/buses/${id}/`, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['buses'] }),
  })

  const deleteBus = useMutation({
    mutationFn: (id) => api.delete(`/buses/${id}/`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['buses'] }),
  })

  return { buses, createBus, updateBus, deleteBus }
}