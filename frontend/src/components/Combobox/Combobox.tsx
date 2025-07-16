import { Check, ChevronDown } from "lucide-react";
import { useEffect, useRef, useState } from "react";

interface ComboboxProps {
  value: string;
  onChange: (value: string) => void;
  options: string[];
  placeholder?: string;
  disabled?: boolean;
}

const Combobox: React.FC<ComboboxProps> = ({
  value,
  onChange,
  options,
  placeholder,
  disabled = false,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const comboboxRef = useRef<HTMLDivElement | null>(null);

  const filteredOptions = options.filter((option: string) =>
    option.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSelect = (option: string) => {
    onChange(option);
    setIsOpen(false);
    setSearchTerm("");
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        comboboxRef.current &&
        !comboboxRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
        setSearchTerm("");
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      return () =>
        document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [isOpen]);

  return (
    <div className="relative" ref={comboboxRef}>
      <div
        className={`w-full p-2 border border-gray-300 rounded-md bg-white cursor-pointer flex justify-between items-center ${
          disabled
            ? "bg-gray-100 cursor-not-allowed"
            : "focus-within:ring-2 focus-within:ring-purple-800 focus-within:border-transparent"
        }`}
        onClick={() => !disabled && setIsOpen(!isOpen)}
      >
        <span className={value ? "text-gray-900" : "text-gray-500"}>
          {value || placeholder}
        </span>
        <ChevronDown
          size={16}
          className={`text-gray-400 transition-transform ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </div>

      {isOpen && !disabled && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60">
          <div className="p-2 border-b">
            <input
              type="text"
              placeholder="Search..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full p-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-purple-800"
              onClick={(e) => e.stopPropagation()}
            />
          </div>
          <div className="max-h-48 overflow-auto">
            {filteredOptions.length === 0 ? (
              <div className="p-2 text-gray-500 text-sm">No options found</div>
            ) : (
              filteredOptions.map((option: string, index: number) => (
                <div
                  key={index}
                  className="p-2 hover:bg-gray-100 cursor-pointer flex justify-between items-center text-sm"
                  onClick={() => handleSelect(option)}
                >
                  <span>{option}</span>
                  {value === option && (
                    <Check size={16} className="text-purple-800" />
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Combobox;