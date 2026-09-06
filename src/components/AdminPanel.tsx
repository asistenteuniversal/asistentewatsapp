import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { DiagnosticModal } from './DiagnosticModal';

interface ClientConfigRow {
  client_id: string;
  system_instructions: string;
  system_memory: string;
  client_name: string;
  is_active: boolean;
  activation_key: string | null;
  hardware_id: string | null;
  client_phone?: string | null;
  rental_days?: number | null;
  rental_start_date?: string | null;
  rental_end_date?: string | null;
  updated_at?: string;
  daily_memory?: string | null;
  memory_days?: number | null;
  sync_memory_to_device?: boolean | null;
  assistant_name?: string | null;
  personality_style?: string | null;
  voice_selection?: string | null;
  client_number?: number | null;
  app_version?: string | null;
}

export const AdminPanel: React.FC = () => {
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [passwordInput, setPasswordInput] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [clients, setClients] = useState<ClientConfigRow[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [isDiagnosticOpen, setIsDiagnosticOpen] = useState<boolean>(false);

  // Estado para el teléfono de soporte de WhatsApp (Ajustes generales)
  const [supportPhone, setSupportPhone] = useState<string>('527712070378');

  // Estados para crear un nuevo cliente
  const [newClientName, setNewClientName] = useState<string>('');
  const [newClientPhone, setNewClientPhone] = useState<string>('');
  const [isCreating, setIsCreating] = useState<boolean>(false);

  // Estado para la barra de búsqueda
  const [searchTerm, setSearchTerm] = useState<string>('');

  // Estado para el reloj dinámico de la cabecera
  const [currentTime, setCurrentTime] = useState<string>('');

  // Estado para la clasificación de filtros rápidos (Mejora 2)
  const [filterType, setFilterType] = useState<'all' | 'active' | 'warning' | 'expired' | 'paused'>('all');

  // Estado para el indicador de autoguardado visual (Mejora 5)
  const [saveStatus, setSaveStatus] = useState<{[key: string]: { text: string; isError: boolean } | null}>({});

  // Estado para las transiciones del botón de guardar días de memoria
  const [savingStates, setSavingStates] = useState<Record<string, 'idle' | 'saving' | 'saved'>>({});

  const showSaveStatus = (clientId: string, text: string, isError: boolean = false) => {
    setSaveStatus(prev => ({ ...prev, [clientId]: { text, isError } }));
    setTimeout(() => {
      setSaveStatus(prev => ({ ...prev, [clientId]: null }));
    }, 2500);
  };

  // Estado para notificaciones flotantes profesionales (auto-guardados rápidos)
  const [notification, setNotification] = useState<{ text: string; isError?: boolean } | null>(null);

  const showNotification = (text: string, isError: boolean = false) => {
    setNotification({ text, isError });
    setTimeout(() => {
      setNotification(null);
    }, 5000);
  };

  // Estados para modales profesionales centralizados y responsivos (creación y confirmación)
  const [modalNotification, setModalNotification] = useState<{ title: string; text: string; isError?: boolean } | null>(null);
  const [modalConfirm, setModalConfirm] = useState<{ title: string; text: string; onConfirm: () => void } | null>(null);

  // Función para determinar el estado de la renta (Mejora 1)
  const getClientRentalStatus = (client: ClientConfigRow) => {
    if (!client.is_active) return 'paused';
    if (!client.rental_end_date) return 'free';

    const end = new Date(client.rental_end_date + 'T23:59:59');
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    end.setHours(0, 0, 0, 0);

    const diffTime = end.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) return 'expired';
    if (diffDays <= 3) return 'warning';
    return 'active';
  };

  // Estilos CSS inline para lograr el oro metálico pulido ultra real con reflejos
  const goldTextGradient = {
    background: 'linear-gradient(135deg, #BF953F 0%, #FCF6BA 25%, #B38728 50%, #FBF5B7 75%, #AA771C 100%)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    textShadow: '0 0 10px rgba(212, 175, 55, 0.1)'
  };

  const goldMetallicBg = {
    background: 'linear-gradient(135deg, #BF953F 0%, #FCF6BA 30%, #B38728 70%, #AA771C 100%)',
    boxShadow: '0 4px 15px rgba(179, 135, 40, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.4)'
  };

  const goldBorderGradient = {
    position: 'relative' as const,
    border: '1px solid transparent',
    backgroundImage: 'linear-gradient(black, black), linear-gradient(135deg, #BF953F, #FCF6BA, #B38728, #AA771C)',
    backgroundOrigin: 'border-box',
    backgroundClip: 'padding-box, border-box'
  };

  // Efecto para actualizar el reloj digital segundo a segundo
  useEffect(() => {
    const updateClock = () => {
      const now = new Date();
      const meses = ['ENE', 'FEB', 'MAR', 'ABR', 'MAY', 'JUN', 'JUL', 'AGO', 'SEP', 'OCT', 'NOV', 'DIC'];
      const dia = String(now.getDate()).padStart(2, '0');
      const mes = meses[now.getMonth()];
      const anio = now.getFullYear();
      let horas = now.getHours();
      const ampm = horas >= 12 ? 'PM' : 'AM';
      horas = horas % 12;
      horas = horas ? horas : 12;
      const strHoras = String(horas).padStart(2, '0');
      const minutos = String(now.getMinutes()).padStart(2, '0');
      const segundos = String(now.getSeconds()).padStart(2, '0');

      setCurrentTime(`${dia} ${mes} ${anio} ${strHoras}:${minutos}:${segundos} ${ampm}`);
    };

    updateClock();
    const timer = setInterval(updateClock, 1000);
    return () => clearInterval(timer);
  }, []);

  // Utilidad para formatear fechas a YYYY-MM-DD (requerido por inputs de tipo date)
  const formatDateToYYYYMMDD = (date: Date): string => {
    const yyyy = date.getFullYear();
    const mm = String(date.getMonth() + 1).padStart(2, '0');
    const dd = String(date.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  };

  // Cargar lista de clientes
  const loadClients = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('asistente_config')
        .select('*')
        .neq('client_id', 'admin')
        .order('client_id', { ascending: true });

      if (error) throw error;
      setClients(data || []);

      // Cargar también el teléfono de soporte y el estado de actualizaciones de la cuenta admin
      const { data: adminData } = await supabase
        .from('asistente_config')
        .select('client_phone, system_memory')
        .eq('client_id', 'admin')
        .single();
      if (adminData) {
        if (adminData.client_phone) {
          setSupportPhone(adminData.client_phone);
        }
        const isAllowed = adminData.system_memory === 'UPDATES_ALLOWED';
        setUpdatesAllowed(isAllowed);
        localStorage.setItem('ava_updates_allowed', isAllowed ? 'true' : 'false');
      }
    } catch (err: any) {
      console.error('Error al cargar clientes:', err);
      // Fallback local silencioso si no se ha configurado la base de datos
      setClients([
        {
          client_id: 'cliente_maestro',
          client_name: 'Cliente Maestro (Modo Offline)',
          client_phone: '5512345678',
          rental_days: 0,
          rental_start_date: '',
          rental_end_date: '',
          system_instructions: 'Eres un asistente de voz inteligente, servicial y amigable. Responde de forma clara, concisa y directa en español.',
          system_memory: '',
          is_active: true,
          activation_key: 'AVA-1234-5678',
          hardware_id: null,
          memory_days: 2
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  // Cargar lista de clientes de forma silenciosa para actualización en tiempo real
  const loadClientsSilently = async () => {
    try {
      const { data, error } = await supabase
        .from('asistente_config')
        .select('*')
        .neq('client_id', 'admin')
        .order('client_id', { ascending: true });

      if (error) throw error;
      setClients(data || []);
    } catch (err: any) {
      console.warn('Error en recarga silenciosa de clientes:', err);
    }
  };

  // Estado para el control global de bloqueo de actualizaciones en la nube
  const [updatesAllowed, setUpdatesAllowed] = useState<boolean>(() => localStorage.getItem('ava_updates_allowed') === 'true');

  // Guardar teléfono de soporte en la base de datos
  const saveSupportPhone = async (phone: string) => {
    try {
      const { error } = await supabase
        .from('asistente_config')
        .update({ client_phone: phone })
        .eq('client_id', 'admin');
      if (error) throw error;
      showNotification('✓ Teléfono de soporte actualizado', false);
    } catch (err: any) {
      console.warn('Error al guardar teléfono de soporte:', err);
      showNotification('⚠ Error al guardar teléfono en la nube', true);
    }
  };

  // Alternar el bloqueo global de actualizaciones para todos los celulares del mundo
  const toggleGlobalUpdates = async () => {
    const nextAllowed = !updatesAllowed;
    setUpdatesAllowed(nextAllowed);
    localStorage.setItem('ava_updates_allowed', nextAllowed ? 'true' : 'false');
    try {
      const { error } = await supabase
        .from('asistente_config')
        .update({ system_memory: nextAllowed ? 'UPDATES_ALLOWED' : 'UPDATES_LOCKED' })
        .eq('client_id', 'admin');
      if (error) throw error;
      showNotification(nextAllowed ? '🟢 Actualizaciones HABILITADAS en la nube' : '🔴 Actualizaciones BLOQUEADAS en la nube', false);
    } catch (err: any) {
      console.warn('Error al sincronizar bloqueo de actualizaciones:', err);
      showNotification('⚠ Error al sincronizar con la nube', true);
    }
  };

  // Intentar iniciar sesión
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    const trimmedInput = passwordInput.trim();

    // 🚀 ATAJO DIRECTO: Aceptar 6551, 86551 y manchas6551 para entrar de inmediato
    if (trimmedInput === '6551' || trimmedInput === '86551' || trimmedInput === 'manchas6551') {
      setIsLoggedIn(true);
      localStorage.setItem('ava_admin_logged', 'true');
      return;
    }

    try {
      const { data, error } = await supabase
        .from('asistente_config')
        .select('system_instructions')
        .eq('client_id', 'admin')
        .single();

      if (!error && data && data.system_instructions === trimmedInput) {
        setIsLoggedIn(true);
        localStorage.setItem('ava_admin_logged', 'true');
      } else {
        setErrorMessage('Contraseña incorrecta');
      }
    } catch (err: any) {
      console.warn('Error de conexión a base de datos. Usando fallback de contraseña local:', err);
      setErrorMessage('Contraseña incorrecta (Usa "manchas6551" para entrar sin base de datos)');
    }
  };

  // Auto-login si ya tenía sesión guardada
  useEffect(() => {
    if (localStorage.getItem('ava_admin_logged') === 'true') {
      setIsLoggedIn(true);
    }
  }, []);

  // Cargar clientes al iniciar sesión y escuchar cambios en tiempo real instantáneo por WebSocket
  useEffect(() => {
    if (isLoggedIn) {
      loadClients();

      // Escucha WebSocket de Supabase en tiempo real (instantáneo)
      const channel = supabase
        .channel('admin_panel_realtime_changes')
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'asistente_config' },
          (payload) => {
            console.log('[Realtime] Cambio detectado en base de datos:', payload);
            loadClientsSilently();
          }
        )
        .subscribe();

      // Polling de respaldo cada 5 segundos
      const interval = setInterval(() => {
        loadClientsSilently();
      }, 5000);

      return () => {
        clearInterval(interval);
        supabase.removeChannel(channel);
      };
    }
  }, [isLoggedIn]);

  // Cerrar sesión
  const handleLogout = () => {
    setIsLoggedIn(false);
    localStorage.removeItem('ava_admin_logged');
    setPasswordInput('');
  };

  // Crear un nuevo cliente
  const handleCreateClient = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newClientName.trim()) return;

    const cleanName = newClientName.trim().toLowerCase().replace(/[^a-z0-9]/g, '_');
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const newClientId = `${cleanName}_${randomSuffix}`;
    const randomKey = String(Math.floor(10000000 + Math.random() * 90000000));

    let phoneVal = newClientPhone.trim().replace(/[^0-9]/g, '');
    if (phoneVal.length === 10) {
      phoneVal = '52' + phoneVal;
    }

    setIsCreating(true);
    try {
      const { error } = await supabase
        .from('asistente_config')
        .insert({
          client_id: newClientId,
          client_name: newClientName.trim(),
          client_phone: phoneVal,
          rental_days: 0,
          rental_start_date: null,
          rental_end_date: null,
          system_instructions: 'Eres un asistente de voz inteligente, servicial y amigable. Responde en español de forma directa.',
          system_memory: '',
          is_active: true,
          activation_key: randomKey,
          hardware_id: null
        } as any);

      if (error) throw error;

      setModalNotification({
        title: "¡Cliente Creado!",
        text: `El cliente se ha registrado correctamente.\n\n👤 NOMBRE:\n${newClientName.trim()}\n\n🆔 CLIENT ID:\n${newClientId}\n\n🔑 CLAVE DE ACCESO:\n${randomKey}`
      });
      setNewClientName('');
      setNewClientPhone('');
      loadClients();
    } catch (err: any) {
      console.warn('Error en la base de datos, simulando inserción local...');
      // Simulación local para que la UI responda de inmediato
      const newMockClient: ClientConfigRow = {
        client_id: newClientId,
        client_name: newClientName.trim(),
        client_phone: phoneVal,
        rental_days: 0,
        rental_start_date: null,
        rental_end_date: null,
        system_instructions: 'Eres un asistente de voz inteligente, servicial y amigable. Responde en español de forma directa.',
        system_memory: '',
        is_active: true,
        activation_key: randomKey,
        hardware_id: null
      };
      setClients(prev => [...prev, newMockClient]);
      setNewClientName('');
      setNewClientPhone('');
      setModalNotification({
        title: "Modo Offline",
        text: `[Sin Conexión] Cliente creado localmente.\n\n👤 NOMBRE:\n${newClientName.trim()}\n\n🆔 CLIENT ID:\n${newClientId}\n\n🔑 CLAVE DE ACCESO:\n${randomKey}`,
        isError: true
      });
    } finally {
      setIsCreating(false);
    }
  };

  // Cambiar el estado de activación (Switch)
  const toggleClientActive = async (clientId: string, currentStatus: boolean) => {
    setClients(prev => prev.map(c => c.client_id === clientId ? { ...c, is_active: !currentStatus } : c));
    try {
      await supabase
        .from('asistente_config')
        .update({ is_active: !currentStatus })
        .eq('client_id', clientId);
    } catch (err: any) {
      console.warn('No se pudo guardar cambio de activación en la nube, se mantiene local.');
    }
  };

  // Guardar instrucciones del asistente
  const saveInstructions = async (clientId: string, text: string) => {
    showSaveStatus(clientId, 'Guardando...', false);
    const client = clients.find(c => c.client_id === clientId);
    const isClearPending = client?.system_memory === 'CLEAR' || client?.system_memory === 'UPDATE_AND_CLEAR';
    const nextOrder = isClearPending ? 'UPDATE_AND_CLEAR' : 'UPDATE_INSTRUCTIONS';

    setClients(prev => prev.map(c => c.client_id === clientId ? { ...c, system_instructions: text, system_memory: nextOrder } : c));
    try {
      const { error } = await supabase
        .from('asistente_config')
        .update({ system_instructions: text, system_memory: nextOrder })
        .eq('client_id', clientId);
      if (error) throw error;
      showSaveStatus(clientId, '✓ Guardado en la nube', false);
    } catch (err: any) {
      console.warn('Fallo de conexión. Cambios guardados localmente.');
      showSaveStatus(clientId, '⚠ Guardado local (Offline)', true);
    }
  };

  // Guardar memoria del asistente (daily_memory)
  const saveMemory = async (clientId: string, text: string) => {
    showSaveStatus(clientId, 'Guardando...', false);
    try {
      const { error } = await supabase
        .from('asistente_config')
        .update({ daily_memory: text })
        .eq('client_id', clientId);
      if (error) throw error;
      setClients(prev => prev.map(c => c.client_id === clientId ? { ...c, daily_memory: text } : c));
      showSaveStatus(clientId, '✓ Memoria guardada', false);
    } catch (err: any) {
      console.warn('Fallo de conexión. Cambios de memoria guardados localmente.');
      showSaveStatus(clientId, '⚠ Memoria guardada local', true);
    }
  };

  // Guardar configuración de días de memoria
  const saveMemoryDays = async (clientId: string, days: number) => {
    showSaveStatus(clientId, 'Guardando...', false);
    setSavingStates(prev => ({ ...prev, [clientId]: 'saving' }));
    try {
      const { error } = await supabase
        .from('asistente_config')
        .update({ memory_days: days })
        .eq('client_id', clientId);
      if (error) throw error;
      
      // Sincronizar estado local de inmediato
      setClients(prev => prev.map(c => c.client_id === clientId ? { ...c, memory_days: days } : c));
      setSavingStates(prev => ({ ...prev, [clientId]: 'saved' }));
      
      // Revertir a 'idle' tras 2 segundos
      setTimeout(() => {
        setSavingStates(prev => ({ ...prev, [clientId]: 'idle' }));
      }, 2000);

      showSaveStatus(clientId, '✓ Días de memoria actualizados', false);
    } catch (err: any) {
      console.error('[Supabase] Error al guardar días de memoria:', err);
      setSavingStates(prev => ({ ...prev, [clientId]: 'idle' }));
      
      // Mostrar el error exacto en ventana emergente de diagnóstico para el usuario
      setModalNotification({
        title: "Error al Guardar Días",
        text: `No se pudo registrar la cantidad de días en la base de datos de Supabase. Detalle del error:\n\n${err.message || JSON.stringify(err) || 'Fallo de red o columna inexistente.'}\n\n*Asegúrate de haber creado la columna 'memory_days' en Supabase ejecutando el script SQL correspondiente.*`,
        isError: true
      });

      showSaveStatus(clientId, '⚠ Guardado local', true);
    }
  };

  // Borrar memoria del cliente
  const clearClientMemory = async (clientId: string) => {
    showSaveStatus(clientId, 'Borrando...', false);
    const client = clients.find(c => c.client_id === clientId);
    const isUpdatePending = client?.system_memory === 'UPDATE_INSTRUCTIONS' || client?.system_memory === 'UPDATE_AND_CLEAR';
    const nextOrder = isUpdatePending ? 'UPDATE_AND_CLEAR' : 'CLEAR';

    setClients(prev => prev.map(c => c.client_id === clientId ? { ...c, daily_memory: '', system_memory: nextOrder } : c));
    try {
      const { error } = await supabase
        .from('asistente_config')
        .update({ daily_memory: '', system_memory: nextOrder })
        .eq('client_id', clientId);
      if (error) throw error;
      showSaveStatus(clientId, '✓ Memoria borrada total', false);
    } catch (err: any) {
      console.warn('Error al borrar memoria:', err);
      showSaveStatus(clientId, '⚠ Error al borrar', true);
    }
  };

  // Enviar orden de sincronización manual de memoria al celular
  const syncMemoryToDevice = async (clientId: string) => {
    showSaveStatus(clientId, 'Enviando...', false);
    try {
      const { error } = await supabase
        .from('asistente_config')
        .update({ sync_memory_to_device: true } as any)
        .eq('client_id', clientId);
      if (error) throw error;
      showSaveStatus(clientId, '✓ Orden enviada', false);
      setNotification({
        title: "⚡ Orden de Sincronización Enviada",
        text: "Se activó la orden. En cuanto el cliente abra su app o se conecte, la memoria editada en este panel se instalará en su celular.",
        isError: false
      });
    } catch (err: any) {
      console.error('[Supabase] Error al activar sincronización:', err);
      showSaveStatus(clientId, '⚠ Error al enviar', true);
    }
  };

  // Guardar número de cliente
  const saveClientNumber = async (clientId: string, num: number) => {
    showSaveStatus(clientId, 'Guardando...', false);
    try {
      const { error } = await supabase
        .from('asistente_config')
        .update({ client_number: num } as any)
        .eq('client_id', clientId);
      if (error) throw error;
      showSaveStatus(clientId, '✓ N. guardado', false);
    } catch (err: any) {
      console.warn('Fallo al sincronizar número de cliente en la nube.');
      showSaveStatus(clientId, '⚠ N. guardado local', true);
    }
  };

  // Guardar teléfono del cliente
  const savePhone = async (clientId: string, phone: string) => {
    showSaveStatus(clientId, 'Guardando...', false);
    try {
      const { error } = await supabase
        .from('asistente_config')
        .update({ client_phone: phone } as any)
        .eq('client_id', clientId);
      if (error) throw error;
      showSaveStatus(clientId, '✓ Teléfono guardado', false);
    } catch (err: any) {
      console.warn('Fallo al sincronizar teléfono en la nube. Se mantiene local.');
      showSaveStatus(clientId, '⚠ Teléfono guardado local', true);
    }
  };

  // Guardar días de renta
  const saveRentalDays = async (clientId: string, days: number) => {
    showSaveStatus(clientId, 'Guardando...', false);
    try {
      const { error } = await supabase
        .from('asistente_config')
        .update({ rental_days: days } as any)
        .eq('client_id', clientId);
      if (error) throw error;
      showSaveStatus(clientId, '✓ Renta actualizada', false);
    } catch (err: any) {
      console.warn('Fallo al sincronizar días de renta en la nube.');
      showSaveStatus(clientId, '⚠ Renta guardada local', true);
    }
  };

  // Guardar fechas de renta
  const saveRentalDate = async (clientId: string, field: 'rental_start_date' | 'rental_end_date', value: string) => {
    showSaveStatus(clientId, 'Guardando...', false);
    try {
      const { error } = await supabase
        .from('asistente_config')
        .update({ [field]: value || null } as any)
        .eq('client_id', clientId);
      if (error) throw error;
      showSaveStatus(clientId, '✓ Fecha guardada', false);
    } catch (err: any) {
      console.warn(`Fallo al sincronizar ${field} en la nube.`);
      showSaveStatus(clientId, '⚠ Fecha guardada local', true);
    }
  };

  // Resetear el enlace del celular (Liberar dispositivo)
  const resetHardwareId = async (clientId: string) => {
    if (!window.confirm('¿Quieres liberar la licencia para que pueda usarse en otro celular?')) return;

    setClients(prev => prev.map(c => c.client_id === clientId ? { ...c, hardware_id: null } : c));
    showSaveStatus(clientId, 'Liberando...', false);
    try {
      const { error } = await supabase
        .from('asistente_config')
        .update({ hardware_id: null })
        .eq('client_id', clientId);
      if (error) throw error;
      showSaveStatus(clientId, '✓ Licencia liberada', false);
    } catch (err: any) {
      console.warn('Fallo al sincronizar liberación en la nube.');
      showSaveStatus(clientId, '⚠ Liberada local', true);
    }
  };

  // Eliminar un cliente permanentemente
  const executeDeleteClient = async (clientId: string) => {
    showSaveStatus(clientId, 'Eliminando...', false);
    try {
      const { error } = await supabase
        .from('asistente_config')
        .delete()
        .eq('client_id', clientId);
      if (error) throw error;
      setClients(prev => prev.filter(c => c.client_id !== clientId));
      setModalNotification({
        title: "Cliente Eliminado",
        text: "El cliente ha sido eliminado permanentemente de la base de datos de Supabase."
      });
    } catch (err: any) {
      console.error('Error al eliminar cliente:', err);
      setModalNotification({
        title: "Fallo al Eliminar",
        text: `No se pudo eliminar en la base de datos en la nube. Detalle:\n${err.message || JSON.stringify(err) || 'Fallo de red o credenciales'}`,
        isError: true
      });
    }
  };

  // Realizar cálculo de estadísticas (Mejora 3)
  const stats = React.useMemo(() => {
    let total = 0;
    let active = 0;
    let warning = 0;
    let expired = 0;
    let paused = 0;

    clients.forEach(c => {
      total++;
      if (!c.is_active) {
        paused++;
      } else {
        const status = getClientRentalStatus(c);
        if (status === 'warning') warning++;
        else if (status === 'expired') expired++;
        else if (status === 'active' || status === 'free') active++;
      }
    });

    return { total, active, warning, expired, paused };
  }, [clients]);

  // Filtrado y ordenamiento consecutivo de clientes en tiempo real
  const filteredClients = clients
    .filter(client => {
      // 1. Filtrar por tipo (Mejora 2)
      if (filterType !== 'all') {
        const status = getClientRentalStatus(client);
        if (filterType === 'active' && status !== 'active' && status !== 'free') return false;
        if (filterType === 'warning' && status !== 'warning') return false;
        if (filterType === 'expired' && status !== 'expired') return false;
        if (filterType === 'paused' && status !== 'paused') return false;
      }

      // 2. Filtrar por término de búsqueda
      const term = searchTerm.toLowerCase().trim();
      if (!term) return true;
      return (
        (client.client_name || '').toLowerCase().includes(term) ||
        (client.client_id || '').toLowerCase().includes(term) ||
        (client.client_phone || '').includes(term) ||
        (client.activation_key || '').toLowerCase().includes(term)
      );
    })
    .sort((a, b) => {
      // AL-PACHUS siempre fijo en la posición #1 hasta arriba
      if (a.client_id === 'al_pachus_9468') return -1;
      if (b.client_id === 'al_pachus_9468') return 1;

      const numA = (a.client_number !== undefined && a.client_number !== null && a.client_number > 0) ? a.client_number : 999;
      const numB = (b.client_number !== undefined && b.client_number !== null && b.client_number > 0) ? b.client_number : 999;
      return numA - numB;
    });

  // PANTALLA DE LOGIN (ORO METALICO PULIDO) — sin botón de diagnóstico
  if (!isLoggedIn) {
    return (
      <div className="w-full h-full min-h-screen bg-black flex items-center justify-center p-4 font-sans select-text">
        <form 
          onSubmit={handleLogin} 
          style={goldBorderGradient}
          className="w-full max-w-sm bg-[#050508] rounded-[2rem] p-8 shadow-[0_0_80px_rgba(191,149,63,0.25)] space-y-8"
        >
          <div className="text-center space-y-2">
            <h1 className="text-3xl font-extrabold uppercase tracking-widest" style={goldTextGradient}>
              Panel AVA
            </h1>
            <div className="w-16 h-[2px] mx-auto bg-gradient-to-r from-transparent via-[#BF953F] to-transparent" />
            <p className="text-[10px] text-[#FCF6BA] uppercase tracking-widest font-semibold">
              Administración Central
            </p>
          </div>

          <div className="space-y-2.5">
            <label className="text-[10px] text-gray-400 block font-bold uppercase tracking-wider">
              Contraseña de acceso
            </label>
            <input
              type="password"
              value={passwordInput}
              onChange={(e) => setPasswordInput(e.target.value)}
              placeholder="Contraseña..."
              className="w-full bg-black/80 border border-[#BF953F]/30 rounded-2xl px-4 py-3.5 text-white text-sm focus:outline-none focus:border-[#FCF6BA] focus:ring-1 focus:ring-[#FCF6BA]/50 transition duration-300 placeholder-gray-600"
              required
            />
          </div>

          {errorMessage && (
            <p className="text-xs text-red-500 text-center font-bold">{errorMessage}</p>
          )}

          <button
            type="submit"
            style={goldMetallicBg}
            className="w-full py-4 text-black font-extrabold rounded-2xl text-xs uppercase tracking-widest transition duration-300 transform active:scale-95 active:brightness-90 hover:brightness-110 cursor-pointer"
          >
            Entrar al Panel
          </button>
        </form>
      </div>
    );
  }

  // PANTALLA PRINCIPAL DEL ADMINISTRADOR (ORO METALICO PULIDO)
  return (
    <div className="w-full min-h-screen bg-[#010103] text-white font-sans select-text pb-20">

      {/* Modal de Diagnóstico — disponible SOLO dentro del panel */}
      <DiagnosticModal
        isOpen={isDiagnosticOpen}
        onClose={() => setIsDiagnosticOpen(false)}
      />

      {/* 📍 CABECERA FIJA SUPERIOR */}
      <header className="sticky top-0 z-50 bg-[#010103]/95 backdrop-blur-md border-b border-[#BF953F]/25 py-4 px-4 sm:px-6 shadow-[0_4px_30px_rgba(0,0,0,0.8)]">
        <div className="max-w-6xl mx-auto flex justify-between items-center gap-3 sm:gap-6">
          
          {/* Lado Izquierdo: Logotipo */}
          <div className="shrink-0">
            <h1 className="text-lg sm:text-xl font-black uppercase tracking-wider" style={goldTextGradient}>
              Panel AVA
            </h1>
          </div>

          {/* Centro 1: Reloj y Fecha */}
          <div className="flex flex-col items-center text-center shrink-0">
            <span className="text-[7.5px] sm:text-[9px] text-white uppercase tracking-widest font-black">TIEMPO DE SERVIDOR</span>
            <span className="font-mono text-[9px] sm:text-xs font-bold text-white mt-0.5 tracking-wide bg-black/80 border border-[#BF953F]/10 px-2 py-0.5 rounded-md whitespace-nowrap">
              {currentTime || 'Cargando reloj...'}
            </span>
          </div>

          {/* Centro 2: WhatsApp de Soporte Técnico */}
          <div className="flex flex-col items-center text-center shrink-0">
            <span className="text-[7.5px] sm:text-[9px] text-white uppercase tracking-widest font-black">WHATSAPP DE SOPORTE</span>
            <input
              type="text"
              value={supportPhone}
              onChange={(e) => setSupportPhone(e.target.value.trim().replace(/[^0-9]/g, ''))}
              onBlur={(e) => saveSupportPhone(e.target.value)}
              placeholder="527712070378"
              className="bg-black/80 border border-[#BF953F]/20 rounded-md px-2 py-0.5 text-[9px] sm:text-xs font-mono text-center text-white focus:outline-none focus:border-[#FCF6BA] w-[105px] sm:w-[130px] mt-0.5"
            />
          </div>

          {/* Centro 3: VERSIÓN DE APK ACTUAL */}
          <div className="flex flex-col items-center text-center shrink-0">
            <span className="text-[7.5px] sm:text-[9px] text-white uppercase tracking-widest font-black">VERSIÓN DE APK ACTUAL: V.1.42</span>
            <span className="font-mono text-[9px] sm:text-xs font-bold text-[#FCF6BA] mt-0.5 tracking-tight whitespace-nowrap">
              APK_SEPTIEMBRE-2-2026_01_55_PM.apk
            </span>
          </div>

          {/* Centro 4: CONTROL GLOBAL DE ACTUALIZACIONES (NUBE) */}
          <div className="flex flex-col items-center text-center shrink-0">
            <span className="text-[7.5px] sm:text-[9px] text-white uppercase tracking-widest font-black">ACTUALIZACIONES</span>
            <button
              type="button"
              onClick={toggleGlobalUpdates}
              className={`mt-0.5 px-2.5 py-0.5 rounded-md font-mono text-[8.5px] sm:text-[10px] font-extrabold uppercase tracking-wider border transition-all duration-200 cursor-pointer whitespace-nowrap active:scale-95 shadow-sm ${
                updatesAllowed
                  ? 'bg-green-950/80 text-green-300 border-green-500/60 hover:bg-green-900/80 shadow-[0_0_10px_rgba(34,197,94,0.2)]'
                  : 'bg-red-950/80 text-red-300 border-red-500/60 hover:bg-red-900/80 shadow-[0_0_10px_rgba(239,68,68,0.2)]'
              }`}
              title={updatesAllowed ? "Actualizaciones ACTIVAS en la nube. Clic para bloquear." : "Actualizaciones BLOQUEADAS en la nube. Clic para permitir."}
            >
              {updatesAllowed ? '🟢 PERMITIDAS' : '🔴 BLOQUEADAS'}
            </button>
          </div>

          {/* Lado Derecho: Diagnóstico + Salir */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => setIsDiagnosticOpen(true)}
              className="px-2 py-1 sm:px-3 sm:py-2 border border-red-500/40 hover:bg-red-500/10 text-red-400 font-bold rounded-xl text-[9px] uppercase tracking-wider transition duration-300 cursor-pointer"
            >
              Diagnosticar 🔍
            </button>
            <button
              onClick={handleLogout}
              className="px-2.5 py-1 sm:px-4 sm:py-2 border border-red-500/50 hover:bg-red-500/10 text-red-400 font-bold rounded-xl text-[10px] uppercase tracking-wider transition duration-300 cursor-pointer"
            >
              Salir
            </button>
          </div>
        </div>
      </header>

      {/* CONTENIDO PRINCIPAL */}
      <main className="max-w-4xl mx-auto p-4 space-y-6">
        
        {/* Estadísticas rápidas (Mejora 3) */}
        <section className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          <div className="bg-[#050508]/80 border border-[#BF953F]/15 rounded-2xl p-3 text-center shadow-[0_0_15px_rgba(191,149,63,0.03)]">
            <p className="text-[8px] text-gray-500 uppercase font-black tracking-wider">Total Clientes</p>
            <p className="text-xl font-bold text-white mt-1">{stats.total}</p>
          </div>
          <div className="bg-[#050508]/80 border border-green-500/20 rounded-2xl p-3 text-center shadow-[0_0_15px_rgba(34,197,94,0.03)]">
            <p className="text-[8px] text-green-400 uppercase font-black tracking-wider">Vigentes 🟢</p>
            <p className="text-xl font-bold text-green-400 mt-1">{stats.active}</p>
          </div>
          <div className="bg-[#050508]/80 border border-amber-500/20 rounded-2xl p-3 text-center shadow-[0_0_15px_rgba(245,158,11,0.03)] animate-pulse">
            <p className="text-[8px] text-amber-400 uppercase font-black tracking-wider">Por Vencer 🟡</p>
            <p className="text-xl font-bold text-amber-400 mt-1">{stats.warning}</p>
          </div>
          <div className="bg-[#050508]/80 border border-red-500/20 rounded-2xl p-3 text-center shadow-[0_0_15px_rgba(239,68,68,0.03)] animate-pulse">
            <p className="text-[8px] text-red-400 uppercase font-black tracking-wider">Vencidos 🔴</p>
            <p className="text-xl font-bold text-red-400 mt-1">{stats.expired}</p>
          </div>
          <div className="bg-[#050508]/80 border border-gray-600/25 rounded-2xl p-3 text-center shadow-md">
            <p className="text-[8px] text-gray-400 uppercase font-black tracking-wider">Pausados ⚪</p>
            <p className="text-xl font-bold text-gray-400 mt-1">{stats.paused}</p>
          </div>
        </section>

        {/* Registro de Nuevo Cliente */}
        <section 
          style={goldBorderGradient}
          className="bg-[#050508] rounded-[2rem] p-6 shadow-[0_0_30px_rgba(191,149,63,0.05)] space-y-4"
        >
          <h2 className="text-[10px] text-[#FCF6BA] font-extrabold uppercase tracking-widest">
            Registrar Nuevo Cliente / Negocio
          </h2>
          <form onSubmit={handleCreateClient} className="flex flex-col sm:flex-row gap-3">
            <input
              type="text"
              value={newClientName}
              onChange={(e) => setNewClientName(e.target.value)}
              placeholder="Nombre del Cliente (ej: Limpidez)"
              className="flex-1 bg-black border border-[#BF953F]/20 rounded-xl px-4 py-3 text-xs focus:outline-none focus:border-[#FCF6BA] text-white transition duration-300"
              required
            />
            <input
              type="text"
              value={newClientPhone}
              onChange={(e) => setNewClientPhone(e.target.value)}
              placeholder="WhatsApp (ej: 5215512345678)"
              className="flex-1 bg-black border border-[#BF953F]/20 rounded-xl px-4 py-3 text-xs focus:outline-none focus:border-[#FCF6BA] text-white transition duration-300 font-mono"
            />
            <button
              type="submit"
              disabled={isCreating}
              style={goldMetallicBg}
              className="px-6 py-3 text-black font-extrabold rounded-xl text-xs uppercase tracking-widest transition duration-300 disabled:opacity-50 active:scale-95"
            >
              {isCreating ? 'Registrando...' : 'Crear Cliente'}
            </button>
          </form>
        </section>

        {/* Barra de Búsqueda */}
        <section 
          style={goldBorderGradient}
          className="bg-[#050508] rounded-2xl p-4 shadow-[0_0_20px_rgba(191,149,63,0.02)]"
        >
          <div className="relative flex items-center">
            <span className="absolute left-3 text-gray-500 text-sm">🔍</span>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar cliente por nombre, ID, WhatsApp o clave..."
              className="w-full bg-black/60 border border-[#BF953F]/15 rounded-xl pl-9 pr-4 py-3 text-xs text-white focus:outline-none focus:border-[#FCF6BA] transition duration-300 placeholder-gray-600"
            />
            {searchTerm && (
              <button 
                onClick={() => setSearchTerm('')} 
                className="absolute right-3 text-xs text-gray-500 hover:text-white"
              >
                ✕
              </button>
            )}
          </div>
        </section>

        {/* Listado de Clientes */}
        <section className="space-y-4">
          <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-3 px-1">
            <h2 className="text-[10px] text-[#FCF6BA] font-extrabold uppercase tracking-widest">
              Listado de Clientes ({filteredClients.length})
            </h2>
            
            {/* Filtros rápidos (Mejora 2) */}
            <div className="flex flex-wrap gap-1.5 text-[9px] uppercase font-black tracking-wider">
              <button 
                onClick={() => setFilterType('all')}
                className={`px-2.5 py-1 rounded-lg border transition ${filterType === 'all' ? 'bg-[#BF953F] text-black border-[#BF953F]' : 'bg-black border-[#BF953F]/20 text-[#FCF6BA]'}`}
              >
                Todos
              </button>
              <button 
                onClick={() => setFilterType('active')}
                className={`px-2.5 py-1 rounded-lg border transition ${filterType === 'active' ? 'bg-green-500 text-black border-green-500' : 'bg-black border-green-500/20 text-green-400'}`}
              >
                Vigentes 🟢
              </button>
              <button 
                onClick={() => setFilterType('warning')}
                className={`px-2.5 py-1 rounded-lg border transition ${filterType === 'warning' ? 'bg-amber-500 text-black border-amber-500' : 'bg-black border-amber-500/20 text-amber-400'}`}
              >
                Por Vencer 🟡
              </button>
              <button 
                onClick={() => setFilterType('expired')}
                className={`px-2.5 py-1 rounded-lg border transition ${filterType === 'expired' ? 'bg-red-500 text-black border-red-500' : 'bg-black border-red-500/20 text-red-400'}`}
              >
                Vencidos 🔴
              </button>
              <button 
                onClick={() => setFilterType('paused')}
                className={`px-2.5 py-1 rounded-lg border transition ${filterType === 'paused' ? 'bg-gray-700 text-white border-gray-700' : 'bg-black border-gray-600/20 text-gray-400'}`}
              >
                Pausados ⚪
              </button>
            </div>
            
            <button 
              onClick={loadClients}
              className="text-xs text-gray-400 hover:text-white transition underline"
            >
              Actualizar Lista
            </button>
          </div>

          {loading && clients.length === 0 ? (
            <p className="text-xs text-gray-500 text-center py-10 uppercase tracking-widest">Cargando clientes...</p>
          ) : filteredClients.length === 0 ? (
            <p className="text-xs text-gray-500 text-center py-10 uppercase tracking-widest">
              {clients.length === 0 ? 'No hay clientes registrados.' : 'No se encontraron resultados.'}
            </p>
          ) : (
            <div className="space-y-5">
              {filteredClients.map((client) => (
                <div
                  key={client.client_id}
                  style={goldBorderGradient}
                  className="bg-[#050508] rounded-[2rem] p-6 space-y-4 shadow-[0_4px_30px_rgba(0,0,0,0.6)]"
                >
                  {/* Encabezado del Cliente: NOMBRE A LA IZQUIERDA, LUEGO N. CLIENTE */}
                  <div className="flex justify-between items-start gap-4">
                    <div>
                      <div className="flex items-center gap-4 flex-wrap">
                        
                        {/* 1. NOMBRE DEL CLIENTE (PRIMERO A LA IZQUIERDA) */}
                        <div className="flex flex-col items-start">
                          <span className="text-[7.5px] text-white uppercase tracking-widest font-black">NOMBRE DE CLIENTE</span>
                          <div className="flex items-center gap-2 mt-0.5">
                            <h3 className="text-lg font-black text-white">{client.client_name || 'Sin Nombre'}</h3>
                            {saveStatus[client.client_id] && (
                              <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full transition-all duration-300 ${
                                saveStatus[client.client_id]?.isError 
                                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' 
                                  : saveStatus[client.client_id]?.text === 'Guardando...'
                                    ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30 animate-pulse'
                                    : 'bg-green-500/20 text-green-300 border border-green-500/30'
                              }`}>
                                {saveStatus[client.client_id]?.text}
                              </span>
                            )}
                          </div>
                        </div>

                        {/* 2. N. CLIENTE A UN LADO (UN POCO MÁS GRANDE) */}
                        <div className="flex flex-col items-center">
                          <span className="text-[7.5px] text-white uppercase tracking-widest font-black">N. CLIENTE</span>
                          <input
                            type="number"
                            min="1"
                            max="999"
                            defaultValue={client.client_number !== undefined && client.client_number !== null ? client.client_number : (client.client_id === 'al_pachus_9468' ? 1 : 2)}
                            className="w-[52px] bg-black/90 border border-[#BF953F]/40 rounded-lg px-1.5 py-1 text-sm font-mono font-black text-[#FCF6BA] text-center focus:outline-none focus:border-[#FCF6BA] shadow-inner mt-0.5"
                            onBlur={(e) => {
                              const val = parseInt(e.target.value, 10) || 1;
                              setClients(prev => prev.map(c => c.client_id === client.client_id ? { ...c, client_number: val } : c));
                              saveClientNumber(client.client_id, val);
                            }}
                          />
                        </div>

                      </div>
                    </div>

                    {/* Switch de Activación (Activo / Pausado) y Acciones */}
                    <div className="flex items-center gap-8 sm:gap-14">
                      {/* Contenedor del Switch al centro */}
                      <div className="flex items-center gap-2">
                        {(() => {
                          const status = getClientRentalStatus(client);
                          if (status === 'paused') {
                            return <span className="text-[8px] uppercase font-black tracking-widest text-red-500 px-2 py-0.5 bg-red-500/10 border border-red-500/20 rounded-md">Pausado ⚪</span>;
                          }
                          if (status === 'free') {
                            return <span className="text-[8px] uppercase font-black tracking-widest text-blue-400 px-2 py-0.5 bg-blue-500/10 border border-blue-500/20 rounded-md">ACTIVO 🔵</span>;
                          }
                          if (status === 'expired') {
                            return <span className="text-[8px] uppercase font-black tracking-widest text-red-400 px-2 py-0.5 bg-red-500/15 border border-red-500/30 rounded-md animate-pulse">Vencido 🔴</span>;
                          }
                          if (status === 'warning') {
                            return <span className="text-[8px] uppercase font-black tracking-widest text-amber-400 px-2 py-0.5 bg-amber-500/15 border border-amber-500/30 rounded-md animate-pulse">Por Vencer 🟡</span>;
                          }
                          return <span className="text-[8px] uppercase font-black tracking-widest text-green-400 px-2 py-0.5 bg-green-500/15 border border-green-500/30 rounded-md">Vigente 🟢</span>;
                        })()}
                        
                        <button
                          onClick={() => toggleClientActive(client.client_id, client.is_active)}
                          className={`w-12 h-6 rounded-full p-1 transition duration-300 focus:outline-none ${client.is_active ? 'bg-green-500' : 'bg-gray-800'}`}
                        >
                          <div
                            className={`w-4 h-4 rounded-full bg-white transition duration-300 ${client.is_active ? 'transform translate-x-6' : ''}`}
                          />
                        </button>
                      </div>

                      {/* Botón Máster de Desconexión Total Web <-> APK */}
                      <button
                        type="button"
                        onClick={async () => {
                          const isAutonomous = client.memory_days === -1;
                          const nextDays = isAutonomous ? 2 : -1;
                          setClients(prev => prev.map(c => c.client_id === client.client_id ? { ...c, memory_days: nextDays } : c));
                          await saveMemoryDays(client.client_id, nextDays);
                        }}
                        className={`px-3 py-1.5 font-black rounded-xl text-[9px] uppercase tracking-wider transition duration-300 border cursor-pointer font-sans shadow-md ${
                          client.memory_days === -1
                            ? 'bg-red-950/40 text-red-400 border-red-500/50 hover:bg-red-950/60 shadow-[0_0_12px_rgba(239,68,68,0.3)] animate-pulse'
                            : 'bg-green-950/40 text-green-400 border-green-500/50 hover:bg-green-950/60 shadow-[0_0_12px_rgba(34,197,94,0.3)]'
                        }`}
                        title="Conectar o desconectar totalmente la página web de la APK del celular"
                      >
                        {client.memory_days === -1 ? '🔴 APP desconectada de nube apagada' : '🟢 APP conectada a nube en vivo'}
                      </button>

                      {/* Botón de Borrado en la esquina extrema derecha */}
                      <button
                        onClick={() => {
                          setModalConfirm({
                            title: "Confirmar Borrado",
                            text: `¿CONFIRME SI DESEA BORRAR ESTE CLIENTE?\n\n"${client.client_name || 'Sin Nombre'}"`,
                            onConfirm: () => executeDeleteClient(client.client_id)
                          });
                        }}
                        className="px-2 py-1 bg-red-600 hover:bg-red-700 active:scale-95 text-white font-extrabold rounded-lg text-[9px] uppercase tracking-wider transition duration-300 flex items-center gap-1 shadow-md shadow-red-900/20 border border-red-500/30"
                        title="Borrar Cliente"
                      >
                        <span>BORRAR CLIENTE 🗑️</span>
                      </button>
                    </div>
                  </div>

                  {/* Clave de Licencia, Celular, Renta, Fechas y ESTADO CELULAR en 5 Columnas con Espacio Ampliado */}
                  <div className="grid grid-cols-1 sm:grid-cols-12 gap-3.5 bg-black/60 rounded-2xl p-4 border border-[#BF953F]/10 text-xs">
                    
                    {/* Columna 1: Clave de Licencia (sm:col-span-2) */}
                    <div className="sm:col-span-2">
                      <p className="text-[9px] text-white uppercase tracking-widest font-black">Clave de Licencia</p>
                      <div className="flex items-center gap-1.5 mt-1.5">
                        <span className="font-mono font-black text-[#FCF6BA] select-all text-sm tracking-wider">
                          {client.activation_key || 'No Generada'}
                        </span>
                        {client.activation_key && (
                          <button
                            onClick={() => {
                              navigator.clipboard.writeText(client.activation_key || '');
                              alert('¡Clave de licencia copiada al portapapeles!');
                            }}
                            className="text-xs hover:scale-115 active:scale-90 transition duration-150 cursor-pointer"
                            title="Copiar Clave"
                          >
                            📋
                          </button>
                        )}
                      </div>
                      
                      {/* Botón de WhatsApp para enviar la clave y fechas */}
                      {client.activation_key && client.client_phone && client.client_phone.trim() && (
                        <div className="mt-2">
                          <a
                            href={(() => {
                              const phone = client.client_phone.trim().replace(/[^0-9]/g, '');
                              const name = client.client_name || 'Cliente';
                              const key = client.activation_key || 'No Generada';
                              const days = client.rental_days;
                              
                              let messageText = '';
                              if (days && days > 0) {
                                messageText = `Hola *${name}*, esta es la clave de tu asistente:\n\n${key}\n\n📅 *Inicio:* ${client.rental_start_date || 'Hoy'}\n⏳ *Vence:* ${client.rental_end_date || 'N/A'} (${days} días de renta)\n\nPor favor, ingresa esta clave en tu aplicación para activar el asistente.`;
                              } else {
                                messageText = `Hola *${name}*, esta es la clave de tu asistente:\n\n${key}\n\n📅 *Vigencia:* Libre (Sin límite de días)\n\nPor favor, ingresa esta clave en tu aplicación para activar el asistente.`;
                              }
                              
                              return `https://api.whatsapp.com/send?phone=${phone}&text=${encodeURIComponent(messageText)}`;
                            })()}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{ backgroundColor: '#25D366', color: '#000000' }}
                            className="inline-block px-2.5 py-1 text-black font-black text-[8px] sm:text-[9px] rounded-lg uppercase tracking-wider hover:brightness-110 active:scale-95 transition duration-300 text-center leading-tight shadow-md"
                            title="Enviar clave y fechas por WhatsApp"
                          >
                            ENVIAR<br/>POR WATTS
                          </a>
                        </div>
                      )}
                    </div>

                    {/* Columna 2: WhatsApp del Cliente (sm:col-span-2) */}
                    <div className="sm:col-span-2">
                      <p className="text-[9px] text-white uppercase tracking-widest font-black">WhatsApp del Cliente</p>
                      <div className="flex flex-col items-start gap-1.5 mt-1.5">
                        <input
                           type="text"
                           defaultValue={client.client_phone || ''}
                           placeholder="Código + número"
                           className="w-full max-w-[125px] bg-black/40 border border-[#BF953F]/20 rounded-lg px-2 py-1 text-xs font-mono font-black text-[#FCF6BA] focus:outline-none focus:border-[#FCF6BA]"
                           onBlur={(e) => {
                             let val = e.target.value.trim().replace(/[^0-9]/g, '');
                             if (val.length === 10) {
                               val = '52' + val;
                               e.target.value = val;
                             }
                             if (val !== client.client_phone) {
                               setClients(prev => prev.map(c => c.client_id === client.client_id ? { ...c, client_phone: val } : c));
                               savePhone(client.client_id, val);
                             }
                           }}
                        />
                        {client.client_phone && client.client_phone.trim() && (
                          <a
                            href={`https://api.whatsapp.com/send?phone=${client.client_phone.trim().replace(/[^0-9]/g, '')}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{ backgroundColor: '#25D366', color: '#000000' }}
                            className="inline-block px-2.5 py-1 text-black font-black text-[8px] sm:text-[9px] rounded-lg uppercase tracking-wider hover:brightness-110 active:scale-95 transition duration-300 text-center leading-tight shadow-md"
                            title="Conversar por WhatsApp"
                          >
                            CONVERSAR<br/>POR WATTS
                          </a>
                        )}
                      </div>
                      <p className="text-[8px] text-gray-500 mt-1 italic font-semibold">
                        {(() => {
                          const cleaned = (client.client_phone || '').trim().replace(/[^0-9]/g, '');
                          if (!cleaned) return 'Sin teléfono';
                          if (cleaned.startsWith('52')) return 'País: México 🇲🇽';
                          return 'País: Internacional 🌐';
                        })()}
                      </p>
                    </div>

                    {/* Columna 3: Días de Renta (sm:col-span-2) */}
                    <div className="sm:col-span-2">
                      <p className="text-[9px] text-white uppercase tracking-widest font-black">Días de Renta</p>
                      <div className="flex items-center mt-1.5">
                        <select
                          value={client.rental_days !== undefined && client.rental_days !== null ? client.rental_days : 0}
                          className="w-full bg-black/40 border border-[#BF953F]/20 rounded-lg px-2 py-1 text-xs font-mono font-black text-[#FCF6BA] focus:outline-none focus:border-[#FCF6BA]"
                          onChange={(e) => {
                            const days = parseInt(e.target.value, 10);
                            let startVal = client.rental_start_date || '';
                            let endVal = client.rental_end_date || '';

                            if (days > 0) {
                              const now = new Date();
                              startVal = formatDateToYYYYMMDD(now);
                              const end = new Date();
                              end.setDate(now.getDate() + days);
                              endVal = formatDateToYYYYMMDD(end);
                            } else {
                              startVal = '';
                              endVal = '';
                            }

                            setClients(prev => prev.map(c => c.client_id === client.client_id ? {
                              ...c,
                              rental_days: days,
                              rental_start_date: startVal,
                              rental_end_date: endVal
                            } : c));

                            saveRentalDays(client.client_id, days);
                            saveRentalDate(client.client_id, 'rental_start_date', startVal);
                            saveRentalDate(client.client_id, 'rental_end_date', endVal);
                          }}
                        >
                          <option value="0">0 (Activo)</option>
                          {Array.from({ length: 31 }, (_, i) => i + 1).map(num => (
                            <option key={num} value={num}>{num} días</option>
                          ))}
                        </select>
                      </div>
                    </div>

                    {/* Columna 4: Fecha Inicio / Vence (sm:col-span-2) */}
                    <div className="sm:col-span-2">
                      <p className="text-[9px] text-white uppercase tracking-widest font-black">Fecha Inicio / Vence</p>
                      <div className="space-y-1 mt-1">
                        <div className="flex items-center gap-1">
                          <span className="text-[9px] text-gray-500 uppercase tracking-widest">Ini:</span>
                          <input
                            type="date"
                            value={client.rental_start_date || ''}
                            className="w-full bg-black border border-[#BF953F]/15 rounded px-1 py-0.5 text-[11px] text-white font-mono focus:outline-none focus:border-[#FCF6BA]"
                            onChange={(e) => {
                              const val = e.target.value;
                              setClients(prev => prev.map(c => c.client_id === client.client_id ? { ...c, rental_start_date: val } : c));
                              saveRentalDate(client.client_id, 'rental_start_date', val);
                            }}
                          />
                        </div>
                        <div className="flex items-center gap-1">
                          <span className="text-[9px] text-gray-500 uppercase tracking-widest">Fin:</span>
                          <input
                            type="date"
                            value={client.rental_end_date || ''}
                            className="w-full bg-black border border-[#BF953F]/15 rounded px-1 py-0.5 text-[11px] text-white font-mono focus:outline-none focus:border-[#FCF6BA]"
                            onChange={(e) => {
                              const val = e.target.value;
                              setClients(prev => prev.map(c => c.client_id === client.client_id ? { ...c, rental_end_date: val } : c));
                              saveRentalDate(client.client_id, 'rental_end_date', val);
                            }}
                          />
                        </div>
                      </div>
                    </div>

                    {/* Columna 5: ESTADO CELULAR (sm:col-span-4 -> AMPLIO Y HORIZONTAL) */}
                    <div className="sm:col-span-4">
                      <p className="text-[9px] text-white uppercase tracking-widest font-black">ESTADO CELULAR</p>
                      {client.hardware_id ? (
                        <div className="space-y-1.5 mt-1.5">
                          {/* LÍNEA 1: ENLAZADO Y LIBERAR */}
                          <div className="flex items-center justify-between gap-1">
                            <span className="text-green-400 font-black uppercase text-[10px] tracking-wider">Enlazado 🟢</span>
                            <button
                              onClick={() => resetHardwareId(client.client_id)}
                              className="text-[9px] text-red-400 hover:text-red-300 font-bold transition uppercase tracking-wider underline"
                            >
                              Liberar
                            </button>
                          </div>
                          
                          {/* LÍNEA 2: VERSIÓN Y ACTUALIZADO EN LA MISMA LÍNEA */}
                          <div className="flex items-center gap-2 bg-black/90 border border-[#BF953F]/30 px-2.5 py-1 rounded-lg">
                            <span className="text-[8px] text-white uppercase tracking-widest font-black shrink-0">VERSIÓN:</span>
                            <span className="text-xs font-mono font-black text-[#FCF6BA] tracking-wide shrink-0">
                              {client.app_version ? `V.${client.app_version}` : 'V.1.42'}
                            </span>
                            <span className="text-[9px] font-bold text-green-400 tracking-wider">
                              (Actualizado 🟢)
                            </span>
                          </div>

                          {/* LÍNEA 3: ID CON SU CÓDIGO */}
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-[8px] text-gray-400 uppercase tracking-widest font-bold shrink-0">ID:</span>
                            <input
                              type="text"
                              readOnly
                              value={client.hardware_id}
                              title="Haz clic para seleccionar todo"
                              onClick={(e) => (e.target as HTMLInputElement).select()}
                              className="w-full bg-black/90 border border-[#BF953F]/40 rounded-lg px-2 py-0.5 text-[11px] font-mono font-bold text-white focus:outline-none focus:border-[#FCF6BA] cursor-text text-center shadow-inner tracking-tight"
                            />
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-1.5 mt-1.5">
                          <p className="text-gray-400 font-bold text-[10px] uppercase tracking-wider">
                            Esperando... ⏳
                          </p>
                          <div className="flex items-center gap-2">
                            <span className="text-[8px] text-gray-400 uppercase tracking-widest font-bold">ID:</span>
                            <input
                              type="text"
                              readOnly
                              value="Sin enlazar"
                              disabled
                              className="w-full bg-black/30 border border-zinc-800 rounded-lg px-2 py-1 text-[10px] font-mono text-zinc-600 focus:outline-none text-center"
                            />
                          </div>
                        </div>
                      )}
                    </div>

                  </div>

                  {/* ── FRANJA DE PERSONALIZACIÓN DEL ASISTENTE Y SELECTOR DE VOZ (ALGIEBA / ZEPHYR) ── */}
                  {(() => {
                    // Extraer nombre y personalidad directamente de system_instructions
                    const instructions = client.system_instructions || '';
                    const nameMatch = instructions.match(/Tu nombre oficial es:\s*"([^"]+)"/);
                    const detectedName = nameMatch ? nameMatch[1] : (client.assistant_name || 'Asistente (Predeterminado)');
                    
                    let detectedPersonality = client.personality_style || 'ELEGANTE Y FORMAL';
                    if (instructions.includes('culta, distinguida, educada')) detectedPersonality = 'ELEGANTE Y FORMAL';
                    else if (instructions.includes('alegre, amigable, optimista')) detectedPersonality = 'ALEGRE Y AMIGABLE';
                    else if (instructions.includes('directo, conciso y sabio')) detectedPersonality = 'SABIO Y CONCISO';
                    else if (instructions.includes('barrio de Tepito') || instructions.includes('barrio popular')) detectedPersonality = 'ESTILO DE BARRIO';
                    else if (instructions.includes('rudo, agresivo, retador, peleonero')) detectedPersonality = 'AGRESIVO Y PELEONERO';
                    else if (instructions.includes('productividad, finanzas, eficiencia ejecutiva')) detectedPersonality = 'EJECUTIVO DE NEGOCIOS';

                    // Detectar voz activa (Hombre o Mujer) directamente de las instrucciones
                    let detectedVoice: 'male' | 'female' = (client.voice_selection as 'male' | 'female') || 'male';
                    if (instructions.includes('asistente femenina (mujer)')) {
                      detectedVoice = 'female';
                    } else if (instructions.includes('asistente masculino (hombre)')) {
                      detectedVoice = 'male';
                    }

                    return (
                      <div className="bg-black/80 rounded-2xl p-4 border border-[#d4af37]/30 shadow-[0_0_25px_rgba(212,175,55,0.1)] space-y-3">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#d4af37]/20 pb-3">
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] text-[#FCF6BA] font-extrabold uppercase tracking-widest">
                              🏷️ NOMBRE ELEGIDO POR EL CLIENTE:
                            </span>
                            <span className="px-3 py-1 bg-[#d4af37]/15 border border-[#d4af37]/40 rounded-xl text-white font-black text-xs font-mono shadow-sm">
                              {detectedName}
                            </span>
                          </div>

                          <div className="flex items-center gap-2">
                            <span className="text-[10px] text-[#FCF6BA] font-extrabold uppercase tracking-widest">
                              🎭 PERSONALIDAD ACTIVA:
                            </span>
                            <span className="px-3 py-1 bg-gradient-to-r from-[#d4af37]/20 to-amber-950/40 border border-[#d4af37]/40 rounded-xl text-[#FCF6BA] font-black text-xs uppercase tracking-wider shadow-sm">
                              {detectedPersonality}
                            </span>
                          </div>
                        </div>

                    {/* Selector de Voz Espejo con Nombres Técnicos para el Administrador */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
                      <div>
                        <p className="text-[10px] text-gray-300 font-extrabold uppercase tracking-wider">
                          🎙️ CONTROL DE VOZ MAESTRO (GOOGLE AI STUDIO):
                        </p>
                        <p className="text-[9px] text-gray-500">
                          Cambia la voz del asistente entre Algieba (Hombre) y Zephyr (Mujer).
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={async () => {
                          const nextVoice = detectedVoice === 'male' ? 'female' : 'male';
                          
                          // Actualizar también la directiva de género en system_instructions
                          const genderDirective = nextVoice === 'male'
                            ? 'GÉNERO E IDENTIDAD: Eres un asistente masculino (hombre). Expresate, habla y reconócete siempre como hombre en todas tus respuestas.'
                            : 'GÉNERO E IDENTIDAD: Eres una asistente femenina (mujer). Expresate, habla y reconócete siempre como mujer en todas tus respuestas.';

                          let updatedInstructions = client.system_instructions || '';
                          if (updatedInstructions.includes('GÉNERO E IDENTIDAD:')) {
                            updatedInstructions = updatedInstructions.replace(/GÉNERO E IDENTIDAD:.*$/m, genderDirective);
                          } else {
                            updatedInstructions = `${genderDirective}\n\n${updatedInstructions}`;
                          }

                          setClients(prev => prev.map(c => c.client_id === client.client_id ? { ...c, voice_selection: nextVoice, system_instructions: updatedInstructions } : c));
                          showSaveStatus(client.client_id, 'Cambiando voz...', false);
                          try {
                            const { error } = await supabase
                              .from('asistente_config')
                              .update({ 
                                system_instructions: updatedInstructions 
                              } as any)
                              .eq('client_id', client.client_id);
                            if (error) throw error;
                            showSaveStatus(client.client_id, '✓ Voz y género actualizados', false);
                          } catch (err: any) {
                            console.error('Error al actualizar voz:', err);
                            showSaveStatus(client.client_id, '⚠ Error al guardar voz', true);
                          }
                        }}
                        className={`px-4 py-2.5 rounded-xl font-black text-[10px] sm:text-xs uppercase tracking-wider transition-all duration-300 border shadow-lg cursor-pointer flex items-center justify-center gap-2 active:scale-95 ${
                          detectedVoice === 'male'
                            ? 'bg-green-950/40 text-green-300 border-green-500/60 hover:bg-green-900/50 shadow-green-950/30'
                            : 'bg-pink-950/40 text-pink-300 border-pink-400/60 hover:bg-pink-900/50 shadow-pink-950/30'
                        }`}
                      >
                        {detectedVoice === 'male' ? (
                          <>
                            <span>🟢 VOZ DE HOMBRE</span>
                            <span className="text-[9px] text-green-200 font-mono bg-green-900/60 px-2 py-0.5 rounded-md border border-green-400/40">
                              (ALGIEBA)
                            </span>
                          </>
                        ) : (
                          <>
                            <span>🌸 VOZ DE MUJER</span>
                            <span className="text-[9px] text-pink-200 font-mono bg-pink-900/60 px-2 py-0.5 rounded-md border border-pink-400/40">
                              (ZEPHYR)
                            </span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                );
              })()}

              {/* Modificar Comportamiento */}
                  <div className="space-y-2">
                    <div className="flex justify-between items-center flex-wrap gap-2">
                      <label className="text-[9px] text-[#FCF6BA] uppercase tracking-widest font-extrabold block">
                        COMPORTAMIENTO ASISTENTE
                      </label>
                      <div className="flex items-center gap-2.5 flex-wrap">
                        {/* Foquito de Estado de Actualización en el Celular */}
                        {client.system_memory === 'UPDATE_INSTRUCTIONS' || client.system_memory === 'UPDATE_AND_CLEAR' ? (
                          <span className="inline-flex items-center gap-1.5 bg-amber-500/15 border border-amber-500/40 text-amber-400 text-[9px] sm:text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full animate-pulse shadow-[0_0_10px_rgba(245,158,11,0.25)]">
                            <span className="w-2 h-2 rounded-full bg-amber-400" />
                            <span>🟠 ACTUALIZACIÓN EN CURSO</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 bg-emerald-500/15 border border-emerald-500/40 text-emerald-400 text-[9px] sm:text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full shadow-[0_0_10px_rgba(16,185,129,0.25)]">
                            <span className="w-2 h-2 rounded-full bg-emerald-400" />
                            <span>🟢 ACTUALIZADO</span>
                          </span>
                        )}
                        <button
                          type="button"
                          onClick={() => {
                            const textarea = document.getElementById(`instructions-${client.client_id}`) as HTMLTextAreaElement;
                            if (textarea) {
                              saveInstructions(client.client_id, textarea.value);
                            }
                          }}
                          className="px-4 py-1.5 bg-red-600 hover:bg-red-700 active:scale-95 text-white text-[11px] font-black rounded-xl uppercase tracking-wider transition duration-300 border border-red-500/30 font-sans cursor-pointer shadow-lg flex items-center gap-1.5"
                        >
                          <span>💾 GUARDAR</span>
                        </button>
                      </div>
                    </div>
                    <textarea
                      id={`instructions-${client.client_id}`}
                      value={client.system_instructions || ''}
                      onChange={(e) => {
                        const val = e.target.value;
                        setClients(prev => prev.map(c => c.client_id === client.client_id ? { ...c, system_instructions: val } : c));
                      }}
                      placeholder="Escribe el comportamiento del asistente aquí..."
                      rows={12}
                      className="w-full bg-black border border-[#BF953F]/25 rounded-2xl p-4 text-base text-white font-sans font-medium leading-relaxed focus:outline-none focus:border-[#FCF6BA] transition duration-300 shadow-inner"
                      onBlur={(e) => {
                        saveInstructions(client.client_id, e.target.value);
                      }}
                    />
                  </div>

                  {/* Memoria de Conversación (Recuerdos del Cliente) */}
                  <div className="space-y-2">
                    <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2">
                      <div className="flex items-center gap-3 flex-wrap">
                        <label className="text-[9px] text-[#FCF6BA] uppercase tracking-widest font-extrabold block">
                          Memoria de Conversación
                        </label>
                        {/* Selector de Días (Dropdown 0 a 31) pegado al título */}
                        <div className="flex items-center gap-1.5">
                          <span className="text-[8px] text-[#FCF6BA] uppercase font-black tracking-wider">Días:</span>
                          <select
                            value={client.memory_days === -1 ? 2 : (client.memory_days !== undefined && client.memory_days !== null ? client.memory_days : 2)}
                            onChange={async (e) => {
                              const val = parseInt(e.target.value, 10);
                              setClients(prev => prev.map(c => c.client_id === client.client_id ? { ...c, memory_days: val } : c));
                              await saveMemoryDays(client.client_id, val);
                            }}
                            className="bg-[#121214] border border-[#BF953F]/40 rounded-xl px-2 py-1 text-cyan-400 font-bold text-[10px] focus:outline-none focus:border-[#FCF6BA] cursor-pointer"
                          >
                            <option value="0" className="bg-[#0b0b0e] text-cyan-200">0 (Infinito)</option>
                            {Array.from({ length: 31 }, (_, i) => i + 1).map((num) => (
                              <option key={num} value={num} className="bg-[#0b0b0e] text-cyan-200">
                                {num === 2 ? `${num} días (Predeterminado)` : `${num} días`}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>
                      <div className="flex items-center gap-2.5 flex-wrap">
                        {/* Foquito de Estado de Borrado de Memoria en el Celular al lado del botón */}
                        {client.system_memory === 'CLEAR' || client.system_memory === 'UPDATE_AND_CLEAR' ? (
                          <span className="inline-flex items-center gap-1.5 bg-amber-500/15 border border-amber-500/40 text-amber-400 text-[9px] sm:text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full animate-pulse shadow-[0_0_10px_rgba(245,158,11,0.25)]">
                            <span className="w-2 h-2 rounded-full bg-amber-400" />
                            <span>🟠 BORRADO PENDIENTE</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 bg-emerald-500/15 border border-emerald-500/40 text-emerald-400 text-[9px] sm:text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full shadow-[0_0_10px_rgba(16,185,129,0.25)]">
                            <span className="w-2 h-2 rounded-full bg-emerald-400" />
                            <span>🟢 BORRADO COMPLETADO</span>
                          </span>
                        )}

                        {/* Botón de Borrado de Memoria (Rojo Estilo Celular) */}
                        <button
                          type="button"
                          onClick={() => clearClientMemory(client.client_id)}
                          className="px-3.5 py-1.5 bg-red-600 hover:bg-red-700 active:scale-95 text-white font-extrabold rounded-xl text-[10px] uppercase tracking-wider transition duration-300 border border-red-500/30 font-sans cursor-pointer shadow-lg"
                        >
                          BORRADO DE MEMORIA DE CONVERSACION
                        </button>
                      </div>
                    </div>
                    <textarea
                      value={client.daily_memory || ''}
                      placeholder="Aquí se guardarán los datos que el asistente aprende del cliente y su historial de conversación..."
                      rows={12}
                      onChange={(e) => {
                        const val = e.target.value;
                        setClients(prev => prev.map(c => c.client_id === client.client_id ? { ...c, daily_memory: val } : c));
                      }}
                      onBlur={(e) => {
                        if (e.target.value !== client.daily_memory) {
                          saveMemory(client.client_id, e.target.value);
                        }
                      }}
                      className="w-full bg-black border border-[#BF953F]/25 rounded-2xl p-4 text-base text-white font-sans font-medium leading-relaxed focus:outline-none focus:border-[#FCF6BA] transition duration-300 shadow-inner"
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>

      {/* Notificación Flotante (Toast) Profesional */}
      {notification && (
        <div className="fixed bottom-6 right-6 z-50 max-w-sm w-full px-4 sm:px-0">
          <div className={`p-5 rounded-2xl shadow-[0_15px_50px_rgba(0,0,0,0.9)] border ${
            notification.isError
              ? 'bg-amber-500/10 border-amber-500/30 text-amber-300'
              : 'bg-[#050508]/95 border-[#BF953F]/30 text-white'
          } backdrop-blur-md flex items-start gap-3.5 transition duration-300 relative`}>
            <div className="text-xl mt-0.5">
              {notification.isError ? '⚠️' : '✨'}
            </div>
            <div className="flex-1">
              <p className="text-[9px] text-[#FCF6BA]/85 uppercase tracking-widest font-black">
                {notification.isError ? 'Alerta / Sin Conexión' : 'Notificación de Sistema'}
              </p>
              <p className="text-xs font-semibold leading-relaxed mt-1 whitespace-pre-line text-gray-200">
                {notification.text}
              </p>
            </div>
            <button
              onClick={() => setNotification(null)}
              className="text-xs text-gray-500 hover:text-white transition cursor-pointer p-0.5 hover:bg-white/5 rounded"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {/* Modal de Notificación Centralizado (Creación / Alertas) */}
      {modalNotification && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
          <div 
            style={goldBorderGradient}
            className="w-full max-w-[450px] bg-[#050508] rounded-[2.5rem] p-8 sm:p-10 shadow-[0_0_80px_rgba(191,149,63,0.35)] space-y-6 text-center animate-fade-in"
          >
            <div className="space-y-2">
              <span className="text-4xl block">{modalNotification.isError ? '⚠️' : '✨'}</span>
              <h2 className="text-2xl sm:text-3xl font-black uppercase tracking-widest" style={goldTextGradient}>
                {modalNotification.title}
              </h2>
              <div className="w-28 h-[2px] mx-auto bg-gradient-to-r from-transparent via-[#BF953F] to-transparent mt-2" />
            </div>

            <div className="bg-black/50 border border-[#BF953F]/15 rounded-3xl p-6 font-mono text-sm leading-relaxed whitespace-pre-line text-[#FCF6BA] font-bold">
              {modalNotification.text}
            </div>

            <button
              onClick={() => setModalNotification(null)}
              style={goldMetallicBg}
              className="w-full py-4 text-black font-black rounded-2xl text-xs sm:text-sm uppercase tracking-widest transition duration-300 transform active:scale-95 hover:brightness-110 shadow-lg cursor-pointer animate-pulse"
            >
              Entendido
            </button>
          </div>
        </div>
      )}

      {/* Modal de Confirmación Centralizado (Borrado) */}
      {modalConfirm && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
          <div 
            style={goldBorderGradient}
            className="w-full max-w-[450px] bg-[#050508] rounded-[2.5rem] p-8 sm:p-10 shadow-[0_0_80px_rgba(191,149,63,0.35)] space-y-6 text-center animate-fade-in"
          >
            <div className="space-y-2">
              <span className="text-4xl block">🗑️</span>
              <h2 className="text-2xl sm:text-3xl font-black uppercase tracking-widest text-red-500 animate-pulse" style={goldTextGradient}>
                {modalConfirm.title}
              </h2>
              <div className="w-28 h-[2px] mx-auto bg-gradient-to-r from-transparent via-[#BF953F] to-transparent mt-2" />
            </div>

            <div className="bg-black/50 border border-[#BF953F]/15 rounded-3xl p-6 font-mono text-sm leading-relaxed whitespace-pre-line text-[#FCF6BA] font-bold">
              {modalConfirm.text}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <button
                onClick={() => {
                  modalConfirm.onConfirm();
                  setModalConfirm(null);
                }}
                className="py-4 bg-red-600 hover:bg-red-700 active:scale-95 text-white font-black rounded-2xl text-xs sm:text-sm uppercase tracking-widest transition duration-300 shadow-md border border-red-500/30 cursor-pointer"
              >
                Confirmar Borrado
              </button>
              <button
                onClick={() => setModalConfirm(null)}
                style={goldMetallicBg}
                className="py-4 text-black font-black rounded-2xl text-xs sm:text-sm uppercase tracking-widest transition duration-300 transform active:scale-95 hover:brightness-110 shadow-lg cursor-pointer"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Diagnóstico de Errores */}
      <DiagnosticModal
        isOpen={isDiagnosticOpen}
        onClose={() => setIsDiagnosticOpen(false)}
      />
    </div>
  );
};
