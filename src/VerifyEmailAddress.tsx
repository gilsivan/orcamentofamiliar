import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useClerk } from "@clerk/clerk-react";

const VerifyEmailAddress = () => {
  const [emailVerificationCode, setEmailVerificationCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const { client } = useClerk();
  const navigate = useNavigate();

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setIsLoading(true);

    try {
      // Usando o método do Clerk para verificar o código de e-mail
      await client.verifyEmailAddress({ code: emailVerificationCode });

      // Redireciona para a página inicial após a verificação bem-sucedida
      navigate("/");
    } catch (error) {
      setErrorMessage("Código de verificação inválido. Tente novamente.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-r from-blue-500/10 to-violet-500/10">
      <div className="w-full max-w-md">
        <h1 className="mb-8 text-center text-2xl font-semibold bg-gradient-to-r from-blue-500 to-violet-500 bg-clip-text text-transparent">
          Verifique seu E-mail
        </h1>
        <div className="rounded-lg border bg-card shadow-sm p-6">
          {errorMessage && (
            <div className="mb-4 text-red-500 text-center">
              <p>{errorMessage}</p>
            </div>
          )}
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label
                htmlFor="verification-code"
                className="block text-sm font-semibold text-gray-700"
              >
                Código de Verificação
              </label>
              <input
                type="text"
                id="verification-code"
                value={emailVerificationCode}
                onChange={(e) => setEmailVerificationCode(e.target.value)}
                className="mt-2 w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <button
              type="submit"
              className="w-full py-2 px-4 bg-blue-500 text-white font-semibold rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={isLoading}
            >
              {isLoading ? "Verificando..." : "Verificar E-mail"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default VerifyEmailAddress;
