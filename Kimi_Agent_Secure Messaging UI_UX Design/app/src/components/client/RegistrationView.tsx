import React, { useState } from 'react';
import { GlassCard } from '@/components/common/GlassCard';
import { GlowButton } from '@/components/common/GlowButton';
import { 
  Smartphone, 
  ChevronDown, 
  Check,
  Shield,
  Lock,
  Key,
  User,
  Camera,
  CheckCircle,
  ArrowRight,
  RefreshCw
} from 'lucide-react';
import { countryCodes } from '@/data/mockData';

interface RegistrationViewProps {
  onComplete?: () => void;
}

type Step = 'phone' | 'verify' | 'device' | 'profile' | 'complete';

export const RegistrationView: React.FC<RegistrationViewProps> = ({ onComplete }) => {
  const [currentStep, setCurrentStep] = useState<Step>('phone');
  const [selectedCountry, setSelectedCountry] = useState(countryCodes[0]);
  const [showCountryDropdown, setShowCountryDropdown] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [verificationCode, setVerificationCode] = useState(['', '', '', '', '', '']);
  const [deviceCode, setDeviceCode] = useState('');
  const [profileName, setProfileName] = useState('');
  const [profileStatus, setProfileStatus] = useState('disponible');
  const [isLoading, setIsLoading] = useState(false);

  const handlePhoneSubmit = () => {
    if (phoneNumber.length >= 10) {
      setIsLoading(true);
      setTimeout(() => {
        setIsLoading(false);
        setCurrentStep('verify');
      }, 1500);
    }
  };

  const handleVerifySubmit = () => {
    const code = verificationCode.join('');
    if (code.length === 6) {
      setIsLoading(true);
      setTimeout(() => {
        setIsLoading(false);
        setCurrentStep('device');
      }, 1500);
    }
  };

  const handleDeviceSubmit = () => {
    if (deviceCode.length >= 6) {
      setIsLoading(true);
      setTimeout(() => {
        setIsLoading(false);
        setCurrentStep('profile');
      }, 1500);
    }
  };

  const handleProfileSubmit = () => {
    if (profileName.trim()) {
      setIsLoading(true);
      setTimeout(() => {
        setIsLoading(false);
        setCurrentStep('complete');
      }, 1500);
    }
  };

  const handleCodeChange = (index: number, value: string) => {
    if (value.length <= 1 && /^[0-9]*$/.test(value)) {
      const newCode = [...verificationCode];
      newCode[index] = value;
      setVerificationCode(newCode);
      
      // Auto-focus next input
      if (value && index < 5) {
        const nextInput = document.getElementById(`code-${index + 1}`);
        nextInput?.focus();
      }
    }
  };

  const steps = [
    { id: 'phone', label: 'Teléfono', icon: Smartphone },
    { id: 'verify', label: 'Verificación', icon: Shield },
    { id: 'device', label: 'Dispositivo', icon: Lock },
    { id: 'profile', label: 'Perfil', icon: User },
  ];

  const renderStepIndicator = () => (
    <div className="flex items-center justify-center gap-2 mb-8">
      {steps.map((step, index) => {
        const isActive = steps.findIndex(s => s.id === currentStep) >= index;
        const isCurrent = step.id === currentStep;
        
        return (
          <React.Fragment key={step.id}>
            <div 
              className={`flex items-center justify-center w-10 h-10 rounded-full transition-all ${
                isCurrent 
                  ? 'bg-secure-lilac text-secure-black'
                  : isActive 
                    ? 'bg-secure-lilac/30 text-secure-lilac'
                    : 'bg-white/5 text-gray-500'
              }`}
            >
              <step.icon className="w-5 h-5" />
            </div>
            {index < steps.length - 1 && (
              <div className={`w-8 h-0.5 ${
                isActive ? 'bg-secure-lilac/50' : 'bg-white/10'
              }`} />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );

  const renderPhoneStep = () => (
    <div className="space-y-6">
      <div className="text-center">
        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-secure-lilac/20 flex items-center justify-center">
          <Smartphone className="w-8 h-8 text-secure-lilac" />
        </div>
        <h3 className="text-xl font-semibold text-white mb-2">
          Ingresa tu número de teléfono
        </h3>
        <p className="text-sm text-gray-400">
          Te enviaremos un código de verificación por SMS
        </p>
      </div>

      <div className="space-y-4">
        {/* Country selector */}
        <div className="relative">
          <button
            onClick={() => setShowCountryDropdown(!showCountryDropdown)}
            className="w-full flex items-center justify-between p-4 bg-secure-gray-medium border border-secure-purple/30 rounded-xl text-white hover:border-secure-lilac/50 transition-all"
          >
            <div className="flex items-center gap-3">
              <span className="text-2xl">{selectedCountry.flag}</span>
              <div className="text-left">
                <p className="font-medium">{selectedCountry.country}</p>
                <p className="text-sm text-gray-400">{selectedCountry.code}</p>
              </div>
            </div>
            <ChevronDown className={`w-5 h-5 text-gray-400 transition-transform ${
              showCountryDropdown && 'rotate-180'
            }`} />
          </button>
          
          {showCountryDropdown && (
            <div className="absolute top-full left-0 right-0 mt-2 max-h-60 overflow-y-auto bg-secure-gray-dark border border-secure-purple/30 rounded-xl z-10 scrollbar-custom">
              {countryCodes.map((country) => (
                <button
                  key={country.code}
                  onClick={() => {
                    setSelectedCountry(country);
                    setShowCountryDropdown(false);
                  }}
                  className="w-full flex items-center gap-3 p-3 hover:bg-white/5 transition-colors"
                >
                  <span className="text-xl">{country.flag}</span>
                  <span className="text-white">{country.country}</span>
                  <span className="text-gray-400 ml-auto">{country.code}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Phone input */}
        <div className="flex gap-3">
          <div className="flex-shrink-0 w-24 p-4 bg-secure-gray-medium border border-secure-purple/30 rounded-xl text-white text-center">
            {selectedCountry.code}
          </div>
          <input
            type="tel"
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, ''))}
            placeholder="555 123 4567"
            className="flex-1 p-4 bg-secure-gray-medium border border-secure-purple/30 rounded-xl text-white placeholder:text-gray-500 focus:outline-none focus:border-secure-lilac/50 transition-all"
          />
        </div>
      </div>

      <GlowButton
        variant="primary"
        className="w-full"
        onClick={handlePhoneSubmit}
        loading={isLoading}
        disabled={phoneNumber.length < 10}
      >
        Continuar
        <ArrowRight className="w-5 h-5" />
      </GlowButton>
    </div>
  );

  const renderVerifyStep = () => (
    <div className="space-y-6">
      <div className="text-center">
        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-secure-lilac/20 flex items-center justify-center">
          <Shield className="w-8 h-8 text-secure-lilac" />
        </div>
        <h3 className="text-xl font-semibold text-white mb-2">
          Verifica tu número
        </h3>
        <p className="text-sm text-gray-400">
          Ingresa el código de 6 dígitos enviado a {selectedCountry.code} {phoneNumber}
        </p>
      </div>

      <div className="flex justify-center gap-2">
        {verificationCode.map((digit, index) => (
          <input
            key={index}
            id={`code-${index}`}
            type="text"
            value={digit}
            onChange={(e) => handleCodeChange(index, e.target.value)}
            maxLength={1}
            className="w-12 h-14 text-center text-2xl font-bold bg-secure-gray-medium border border-secure-purple/30 rounded-xl text-white focus:outline-none focus:border-secure-lilac focus:ring-2 focus:ring-secure-lilac/30 transition-all"
          />
        ))}
      </div>

      <div className="text-center">
        <button className="text-sm text-secure-lilac hover:underline">
          ¿No recibiste el código? Reenviar
        </button>
      </div>

      <GlowButton
        variant="primary"
        className="w-full"
        onClick={handleVerifySubmit}
        loading={isLoading}
        disabled={verificationCode.join('').length !== 6}
      >
        Verificar
        <Check className="w-5 h-5" />
      </GlowButton>
    </div>
  );

  const renderDeviceStep = () => (
    <div className="space-y-6">
      <div className="text-center">
        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-secure-lilac/20 flex items-center justify-center">
          <Lock className="w-8 h-8 text-secure-lilac" />
        </div>
        <h3 className="text-xl font-semibold text-white mb-2">
          Vincula tu dispositivo
        </h3>
        <p className="text-sm text-gray-400">
          Ingresa el código de vinculación para activar el cifrado de extremo a extremo
        </p>
      </div>

      <div className="bg-secure-purple/20 border border-secure-lilac/30 rounded-xl p-4">
        <div className="flex items-center gap-3 mb-3">
          <Key className="w-5 h-5 text-secure-lilac" />
          <span className="text-sm text-secure-lilac">Código de vinculación</span>
        </div>
        <input
          type="text"
          value={deviceCode}
          onChange={(e) => setDeviceCode(e.target.value.toUpperCase())}
          placeholder="XXXX-XXXX-XXXX"
          className="w-full p-4 bg-secure-black/50 border border-secure-purple/30 rounded-xl text-white text-center text-2xl font-mono tracking-wider placeholder:text-gray-600 focus:outline-none focus:border-secure-lilac/50 transition-all"
        />
      </div>

      <div className="text-center">
        <button className="flex items-center gap-2 mx-auto text-sm text-secure-lilac hover:underline">
          <RefreshCw className="w-4 h-4" />
          Generar nuevo código
        </button>
      </div>

      <GlowButton
        variant="primary"
        className="w-full"
        onClick={handleDeviceSubmit}
        loading={isLoading}
        disabled={deviceCode.length < 6}
      >
        Vincular dispositivo
        <ArrowRight className="w-5 h-5" />
      </GlowButton>
    </div>
  );

  const renderProfileStep = () => (
    <div className="space-y-6">
      <div className="text-center">
        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-secure-lilac/20 flex items-center justify-center">
          <User className="w-8 h-8 text-secure-lilac" />
        </div>
        <h3 className="text-xl font-semibold text-white mb-2">
          Configura tu perfil
        </h3>
        <p className="text-sm text-gray-400">
          Personaliza tu información visible para otros usuarios
        </p>
      </div>

      {/* Avatar upload */}
      <div className="text-center">
        <div className="relative inline-block">
          <div className="w-24 h-24 rounded-full bg-gradient-to-br from-secure-lilac/30 to-secure-purple/50 flex items-center justify-center border-2 border-secure-lilac/30">
            <Camera className="w-8 h-8 text-secure-lilac" />
          </div>
          <button className="absolute bottom-0 right-0 w-8 h-8 bg-secure-lilac rounded-full flex items-center justify-center">
            <Camera className="w-4 h-4 text-secure-black" />
          </button>
        </div>
      </div>

      {/* Name input */}
      <div>
        <label className="block text-sm text-gray-400 mb-2">Nombre</label>
        <input
          type="text"
          value={profileName}
          onChange={(e) => setProfileName(e.target.value)}
          placeholder="Tu nombre"
          className="w-full p-4 bg-secure-gray-medium border border-secure-purple/30 rounded-xl text-white placeholder:text-gray-500 focus:outline-none focus:border-secure-lilac/50 transition-all"
        />
      </div>

      {/* Status selector */}
      <div>
        <label className="block text-sm text-gray-400 mb-2">Estado</label>
        <div className="grid grid-cols-2 gap-2">
          {[
            { value: 'disponible', label: 'Disponible', color: 'bg-green-500' },
            { value: 'ocupado', label: 'Ocupado', color: 'bg-red-500' },
            { value: 'ausente', label: 'Ausente', color: 'bg-yellow-500' },
          ].map((status) => (
            <button
              key={status.value}
              onClick={() => setProfileStatus(status.value)}
              className={`flex items-center gap-2 p-3 rounded-xl transition-all ${
                profileStatus === status.value
                  ? 'bg-secure-lilac/20 border border-secure-lilac/50'
                  : 'bg-white/5 hover:bg-white/10'
              }`}
            >
              <span className={`w-3 h-3 rounded-full ${status.color}`} />
              <span className="text-sm text-white">{status.label}</span>
            </button>
          ))}
        </div>
      </div>

      <GlowButton
        variant="primary"
        className="w-full"
        onClick={handleProfileSubmit}
        loading={isLoading}
        disabled={!profileName.trim()}
      >
        Completar registro
        <Check className="w-5 h-5" />
      </GlowButton>
    </div>
  );

  const renderCompleteStep = () => (
    <div className="text-center space-y-6">
      <div className="w-20 h-20 mx-auto rounded-full bg-green-500/20 flex items-center justify-center">
        <CheckCircle className="w-10 h-10 text-green-400" />
      </div>
      
      <div>
        <h3 className="text-2xl font-semibold text-white mb-2">
          ¡Registro completado!
        </h3>
        <p className="text-gray-400">
          Tu cuenta ha sido verificada exitosamente
        </p>
      </div>

      <GlassCard variant="purple" className="p-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-secure-lilac/20 flex items-center justify-center">
            <Shield className="w-6 h-6 text-secure-lilac" />
          </div>
          <div className="text-left">
            <p className="font-medium text-white">Cifrado activado</p>
            <p className="text-sm text-gray-400">Tus mensajes están protegidos</p>
          </div>
        </div>
      </GlassCard>

      <GlowButton
        variant="primary"
        className="w-full"
        onClick={onComplete}
      >
        Comenzar a chatear
        <ArrowRight className="w-5 h-5" />
      </GlowButton>
    </div>
  );

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-secure-black via-secure-purple/20 to-secure-black">
      <GlassCard className="w-full max-w-md p-8">
        {currentStep !== 'complete' && renderStepIndicator()}
        
        {currentStep === 'phone' && renderPhoneStep()}
        {currentStep === 'verify' && renderVerifyStep()}
        {currentStep === 'device' && renderDeviceStep()}
        {currentStep === 'profile' && renderProfileStep()}
        {currentStep === 'complete' && renderCompleteStep()}
      </GlassCard>
    </div>
  );
};

export default RegistrationView;
