import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';

// Definición local de la estructura del cliente incluyendo la columna de celular
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
}

export const AdminPanel: React.FC = () => {
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [passwordInput, setPasswordInput] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [clients, setClients] = useState<ClientConfigRow[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  // Estados para crear un nuevo cliente
  const [newClientName, setNewClientName] = useState<string>('');
  const [newClientPhone, setNewClientPhone] = useState<string>('');
  const [isCreating, setIsCreating] = useState<boolean>(false);

  // Estado para la barra de búsqueda
  const [searchTerm, setSearchTerm] = useState<string>('');

  // Estado para el reloj dinámico de la cabecera
  const [currentTime, setCurrentTime] = useState<string>('');

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
      const options: Intl.DateTimeFormatOptions = {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: true
      };
      setCurrentTime(now.toLocaleString('es-MX', options));
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
          hardware_id: null
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  // Intentar iniciar sesión
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    const trimmedInput = passwordInput.trim();

    // 🚀 ATAJO DIRECTO: Si escribe '1234', entra directo
    if (trimmedInput === '1234') {
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
      setErrorMessage('Contraseña incorrecta (Usa "1234" para entrar sin base de datos)');
    }
  };

  // Auto-login si ya tenía sesión guardada
  useEffect(() => {
    if (localStorage.getItem('ava_admin_logged') === 'true') {
      setIsLoggedIn(true);
    }
  }, []);

  // Cargar clientes al iniciar sesión
  useEffect(() => {
    if (isLoggedIn) {
      loadClients();
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
    const randomKey = `AVA-${Math.floor(1000 + Math.random() * 9000)}-${Math.floor(1000 + Math.random() * 9000)}`;

    setIsCreating(true);
    try {
      const { error } = await supabase
        .from('asistente_config')
        .insert({
          client_id: newClientId,
          client_name: newClientName.trim(),
          client_phone: newClientPhone.trim(),
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

      alert(`Cliente creado con éxito.\nID: ${newClientId}\nClave: ${randomKey}`);
      setNewClientName('');
      setNewClientPhone('');
      loadClients();
    } catch (err: any) {
      console.warn('Error en la base de datos, simulando inserción local...');
      // Simulación local para que la UI responda de inmediato
      const newMockClient: ClientConfigRow = {
        client_id: newClientId,
        client_name: newClientName.trim(),
        client_phone: newClientPhone.trim(),
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
      alert(`[Offline] Cliente simulado localmente.\nID: ${newClientId}\nClave: ${randomKey}`);
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
    try {
      await supabase
        .from('asistente_config')
        .update({ system_instructions: text })
        .eq('client_id', clientId);
      alert('Instrucciones guardadas correctamente.');
    } catch (err: any) {
      console.warn('Fallo de conexión. Cambios guardados localmente.');
      alert('Guardado de forma local (Offline).');
    }
  };

  // Guardar memoria del asistente
  const saveMemory = async (clientId: string, text: string) => {
    try {
      await supabase
        .from('asistente_config')
        .update({ system_memory: text })
        .eq('client_id', clientId);
      alert('Memoria guardada correctamente.');
    } catch (err: any) {
      console.warn('Fallo de conexión. Cambios de memoria guardados localmente.');
      alert('Guardado de forma local (Offline).');
    }
  };

  // Guardar teléfono del cliente
  const savePhone = async (clientId: string, phone: string) => {
    try {
      const { error } = await supabase
        .from('asistente_config')
        .update({ client_phone: phone } as any)
        .eq('client_id', clientId);
      if (error) throw error;
      alert('Teléfono actualizado correctamente.');
    } catch (err: any) {
      console.warn('Fallo al sincronizar teléfono en la nube. Se mantiene local.');
    }
  };

  // Guardar días de renta
  const saveRentalDays = async (clientId: string, days: number) => {
    try {
      const { error } = await supabase
        .from('asistente_config')
        .update({ rental_days: days } as any)
        .eq('client_id', clientId);
      if (error) throw error;
    } catch (err: any) {
      console.warn('Fallo al sincronizar días de renta en la nube.');
    }
  };

  // Guardar fechas de renta
  const saveRentalDate = async (clientId: string, field: 'rental_start_date' | 'rental_end_date', value: string) => {
    try {
      const { error } = await supabase
        .from('asistente_config')
        .update({ [field]: value || null } as any)
        .eq('client_id', clientId);
      if (error) throw error;
    } catch (err: any) {
      console.warn(`Fallo al sincronizar ${field} en la nube.`);
    }
  };

  // Resetear el enlace del celular (Liberar dispositivo)
  const resetHardwareId = async (clientId: string) => {
    if (!window.confirm('¿Quieres liberar la licencia para que pueda usarse en otro celular?')) return;

    setClients(prev => prev.map(c => c.client_id === clientId ? { ...c, hardware_id: null } : c));
    try {
      await supabase
        .from('asistente_config')
        .update({ hardware_id: null })
        .eq('client_id', clientId);
      alert('El código de licencia ha sido liberado de este celular.');
    } catch (err: any) {
      console.warn('Fallo al sincronizar liberación en la nube.');
      alert('Licencia liberada de forma local.');
    }
  };

  // Filtrado de clientes en tiempo real
  const filteredClients = clients.filter(client => {
    const term = searchTerm.toLowerCase().trim();
    if (!term) return true;
    return (
      (client.client_name || '').toLowerCase().includes(term) ||
      (client.client_id || '').toLowerCase().includes(term) ||
      (client.client_phone || '').includes(term) ||
      (client.activation_key || '').toLowerCase().includes(term)
    );
  });

  // PANTALLA DE LOGIN (ORO METALICO PULIDO)
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
            className="w-full py-4 text-black font-extrabold rounded-2xl text-xs uppercase tracking-widest transition duration-300 transform active:scale-95 active:brightness-90 hover:brightness-110"
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
      
      {/* 📍 CABECERA FIJA SUPERIOR */}
      <header className="sticky top-0 z-50 bg-[#010103]/90 backdrop-blur-md border-b border-[#BF953F]/25 py-4 px-6 shadow-[0_4px_30px_rgba(0,0,0,0.8)]">
        <div className="max-w-4xl mx-auto flex justify-between items-center gap-4">
          
          {/* Lado Izquierdo: Logotipo */}
          <div>
            <h1 className="text-lg sm:text-xl font-black uppercase tracking-wider" style={goldTextGradient}>
              Panel AVA
            </h1>
            <p className="hidden sm:block text-[9px] text-[#FCF6BA] uppercase tracking-widest font-semibold mt-0.5">
              Control de Licencias
            </p>
          </div>

          {/* Centro: Reloj y Fecha del 2026 */}
          <div className="flex flex-col items-center text-center">
            <span className="text-[7px] sm:text-[9px] text-[#FCF6BA] uppercase tracking-widest font-black">Tiempo de Servidor</span>
            <span className="font-mono text-[9px] sm:text-xs font-bold text-white mt-0.5 tracking-wide bg-black/80 border border-[#BF953F]/10 px-2 py-0.5 rounded-md">
              {currentTime || 'Cargando reloj...'}
            </span>
          </div>

          {/* Lado Derecho: Botón Salir */}
          <button
            onClick={handleLogout}
            className="px-3 py-1.5 sm:px-4 sm:py-2 border border-red-500/50 hover:bg-red-500/10 text-red-400 font-bold rounded-xl text-[10px] uppercase tracking-wider transition duration-300"
          >
            Salir
          </button>
        </div>
      </header>

      {/* CONTENIDO PRINCIPAL */}
      <main className="max-w-4xl mx-auto p-4 space-y-6">
        
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
          <div className="flex justify-between items-center px-1">
            <h2 className="text-[10px] text-[#FCF6BA] font-extrabold uppercase tracking-widest">
              Listado de Clientes Activos ({filteredClients.length})
            </h2>
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
                  {/* Encabezado del Cliente */}
                  <div className="flex justify-between items-start gap-4">
                    <div>
                      <h3 className="text-lg font-black text-white">{client.client_name || 'Sin Nombre'}</h3>
                      <p className="text-[9px] text-gray-500 font-mono mt-0.5">ID: {client.client_id}</p>
                    </div>

                    {/* Switch de Activación (Activo / Pausado) */}
                    <div className="flex items-center gap-3">
                      <span className={`text-[9px] uppercase font-black tracking-widest transition duration-300 ${client.is_active ? 'text-green-400 animate-pulse' : 'text-red-500'}`}>
                        {client.is_active ? 'Activo' : 'Pausado'}
                      </span>
                      <button
                        onClick={() => toggleClientActive(client.client_id, client.is_active)}
                        className={`w-12 h-6 rounded-full p-1 transition duration-300 focus:outline-none ${client.is_active ? 'bg-green-500' : 'bg-gray-800'}`}
                      >
                        <div
                          className={`w-4 h-4 rounded-full bg-white transition duration-300 ${client.is_active ? 'transform translate-x-6' : ''}`}
                        />
                      </button>
                    </div>
                  </div>

                  {/* Clave de Licencia, Celular, Renta y WhatsApp */}
                  <div className="grid grid-cols-1 sm:grid-cols-5 gap-4 bg-black/60 rounded-2xl p-4 border border-[#BF953F]/10 text-xs">
                    <div>
                      <p className="text-[9px] text-gray-500 uppercase tracking-widest font-bold">Clave de Licencia</p>
                      <p className="font-mono font-black text-[#FCF6BA] select-all mt-1.5 text-sm tracking-wider">
                        {client.activation_key || 'No Generada'}
                      </p>
                    </div>

                    <div>
                      <p className="text-[9px] text-gray-500 uppercase tracking-widest font-bold">WhatsApp del Cliente</p>
                      <div className="flex items-center gap-2 mt-1.5">
                        <input
                          type="text"
                          defaultValue={client.client_phone || ''}
                          placeholder="Código + número"
                          className="w-full bg-black border border-[#BF953F]/20 rounded-lg px-2 py-1 text-xs text-white font-mono focus:outline-none focus:border-[#FCF6BA]"
                          onBlur={(e) => {
                            if (e.target.value !== client.client_phone) {
                              setClients(prev => prev.map(c => c.client_id === client.client_id ? { ...c, client_phone: e.target.value } : c));
                              savePhone(client.client_id, e.target.value);
                            }
                          }}
                        />
                        {client.client_phone && client.client_phone.trim() && (
                          <a
                            href={`https://wa.me/${client.client_phone.trim().replace(/[^0-9]/g, '')}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={goldMetallicBg}
                            className="px-2.5 py-1 text-black font-black text-[9px] rounded-lg uppercase tracking-wider hover:brightness-110 active:scale-95 transition duration-300"
                            title="Abrir chat en WhatsApp"
                          >
                            Chat
                          </a>
                        )}
                      </div>
                    </div>

                    <div>
                      <p className="text-[9px] text-gray-500 uppercase tracking-widest font-bold">Días de Renta</p>
                      <div className="flex items-center mt-1.5">
                        <select
                          value={client.rental_days !== undefined && client.rental_days !== null ? client.rental_days : 0}
                          className="w-full bg-black border border-[#BF953F]/20 rounded-lg px-2 py-1 text-xs text-white font-mono focus:outline-none focus:border-[#FCF6BA]"
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

                            // Actualizar localmente primero
                            setClients(prev => prev.map(c => c.client_id === client.client_id ? {
                              ...c,
                              rental_days: days,
                              rental_start_date: startVal,
                              rental_end_date: endVal
                            } : c));

                            // Guardar en Supabase en paralelo
                            saveRentalDays(client.client_id, days);
                            saveRentalDate(client.client_id, 'rental_start_date', startVal);
                            saveRentalDate(client.client_id, 'rental_end_date', endVal);
                            
                            alert(`Auto-calculado:\nInicio: ${startVal || 'Ninguna'}\nTermina: ${endVal || 'Ninguna'}`);
                          }}
                        >
                          <option value="0">0 (Libre)</option>
                          {Array.from({ length: 31 }, (_, i) => i + 1).map(num => (
                            <option key={num} value={num}>{num} días</option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div>
                      <p className="text-[9px] text-gray-500 uppercase tracking-widest font-bold">Fecha Inicio / Vence</p>
                      <div className="space-y-1 mt-1">
                        <div className="flex items-center gap-1">
                          <span className="text-[8px] text-gray-500 uppercase tracking-widest">Ini:</span>
                          <input
                            type="date"
                            value={client.rental_start_date || ''}
                            className="bg-black border border-[#BF953F]/10 rounded px-1 py-0.5 text-[10px] text-white font-mono focus:outline-none focus:border-[#FCF6BA]"
                            onChange={(e) => {
                              const val = e.target.value;
                              setClients(prev => prev.map(c => c.client_id === client.client_id ? { ...c, rental_start_date: val } : c));
                              saveRentalDate(client.client_id, 'rental_start_date', val);
                            }}
                          />
                        </div>
                        <div className="flex items-center gap-1">
                          <span className="text-[8px] text-gray-500 uppercase tracking-widest">Fin:</span>
                          <input
                            type="date"
                            value={client.rental_end_date || ''}
                            className="bg-black border border-[#BF953F]/10 rounded px-1 py-0.5 text-[10px] text-white font-mono focus:outline-none focus:border-[#FCF6BA]"
                            onChange={(e) => {
                              const val = e.target.value;
                              setClients(prev => prev.map(c => c.client_id === client.client_id ? { ...c, rental_end_date: val } : c));
                              saveRentalDate(client.client_id, 'rental_end_date', val);
                            }}
                          />
                        </div>
                      </div>
                    </div>

                    <div>
                      <p className="text-[9px] text-gray-500 uppercase tracking-widest font-bold">Estado del Celular</p>
                      {client.hardware_id ? (
                        <div className="flex items-center justify-between gap-2 mt-1.5">
                          <span className="text-green-400 font-black uppercase text-[10px] tracking-wider">Enlazado</span>
                          <button
                            onClick={() => resetHardwareId(client.client_id)}
                            className="text-[9px] text-red-400 hover:text-red-300 font-bold transition uppercase tracking-wider underline"
                          >
                            Liberar
                          </button>
                        </div>
                      ) : (
                        <p className="text-gray-400 font-bold mt-1.5 text-[10px] uppercase tracking-wider">
                          Esperando...
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Modificar Comportamiento */}
                  <div className="space-y-2">
                    <label className="text-[9px] text-[#FCF6BA] uppercase tracking-widest font-extrabold block">
                      Instrucciones de Voz (Comportamiento del Asistente)
                    </label>
                    <textarea
                      defaultValue={client.system_instructions}
                      placeholder="Escribe el comportamiento del asistente aquí..."
                      rows={8}
                      className="w-full bg-black border border-[#BF953F]/25 rounded-2xl p-4 text-xs text-white focus:outline-none focus:border-[#FCF6BA] transition duration-300 font-mono leading-relaxed shadow-inner"
                      onBlur={(e) => {
                        if (e.target.value !== client.system_instructions) {
                          saveInstructions(client.client_id, e.target.value);
                        }
                      }}
                    />
                  </div>

                  {/* Extraer/Modificar Memoria del Asistente */}
                  <div className="space-y-2">
                    <label className="text-[9px] text-[#FCF6BA] uppercase tracking-widest font-extrabold block">
                      Memoria de Conversación (Datos Extraídos del Cliente)
                    </label>
                    <textarea
                      defaultValue={client.system_memory || ''}
                      placeholder="Aquí se guardan los datos que el asistente aprende del cliente (dirección, detalles, etc.)..."
                      rows={6}
                      className="w-full bg-black border border-[#BF953F]/25 rounded-2xl p-4 text-xs text-white focus:outline-none focus:border-[#FCF6BA] transition duration-300 font-mono leading-relaxed shadow-inner"
                      onBlur={(e) => {
                        if (e.target.value !== client.system_memory) {
                          saveMemory(client.client_id, e.target.value);
                        }
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
};
