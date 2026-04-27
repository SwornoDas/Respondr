import {
  type CreateIncidentInput,
  type IncidentRecord,
  type StaffMember,
  type UpdateIncidentStatusInput,
} from "../types";
import { supabase } from "@/lib/supabase";
import { getPriorityForIncident } from "../utils";

export async function listIncidents() {
  const { data, error } = await supabase
    .from('incidents')
    .select('*')
    .order('timestamp', { ascending: false });

  if (error) {
    console.error('Error listing incidents:', error);
    return [];
  }

  // Map database fields to application types
  return data.map(record => ({
    id: record.id,
    category: record.type,
    roomNumber: record.room,
    description: record.description,
    status: record.status,
    priority: getPriorityForIncident(record.type, record.description),
    createdAt: record.timestamp,
    guestPhone: '', // Not in current schema, would need update if required
    assignedStaffId: record.assigned_to,
  })) as IncidentRecord[];
}

export async function listOnlineStaff() {
  const { data, error } = await supabase
    .from('staff_status')
    .select('*')
    .eq('is_online', true);

  if (error) {
    console.error('Error listing staff:', error);
    return [];
  }

  return data.map(record => ({
    id: record.id,
    name: record.name,
    email: record.email,
    isOnline: record.is_online,
  })) as StaffMember[];
}

export async function createIncident(input: CreateIncidentInput) {
  const { data, error } = await supabase
    .from('incidents')
    .insert({
      type: input.category,
      room: input.roomNumber,
      description: input.description,
      status: 'REPORTED',
    })
    .select()
    .single();

  if (error) {
    console.error('Error creating incident:', error);
    throw new Error('Failed to create incident');
  }

  return {
    id: data.id,
    category: data.type,
    roomNumber: data.room,
    description: data.description,
    status: data.status,
    priority: getPriorityForIncident(data.type, data.description),
    createdAt: data.timestamp,
    assignedStaffId: data.assigned_to,
  } as IncidentRecord;
}

export async function updateIncidentStatus(
  id: string,
  input: UpdateIncidentStatusInput,
) {
  const { data, error } = await supabase
    .from('incidents')
    .update({
      status: input.status,
      assigned_to: input.assignedStaffId,
    })
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Error updating incident:', error);
    return null;
  }

  return {
    id: data.id,
    category: data.type,
    roomNumber: data.room,
    description: data.description,
    status: data.status,
    priority: getPriorityForIncident(data.type, data.description),
    createdAt: data.timestamp,
    assignedStaffId: data.assigned_to,
  } as IncidentRecord;
}
