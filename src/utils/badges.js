import {
  Crown, Heart, Sprout, Footprints, Music,
  Lightbulb, Shield, Flame, Scroll, Sword,
  Zap, Star, Gavel, User, Mountain, Anchor,
  Hammer, Cloud, Sun, Book, Users, Key,
  Eye, Trophy
} from "lucide-react";

export const getBadgeConfig = (bookId) => {
  const id = Number(bookId);

  const badges = {
    1: { icon: Sprout, color: "#4ade80", label: "A Criação" },
    2: { icon: Footprints, color: "#fbbf24", label: "A Jornada" },
    3: { icon: Scroll, color: "#a8a29e", label: "A Lei" },
    4: { icon: Footprints, color: "#d97706", label: "O Deserto" },
    5: { icon: Scroll, color: "#a8a29e", label: "A Aliança" },
    6: { icon: Sword, color: "#f87171", label: "A Conquista" },
    7: { icon: Gavel, color: "#a3a3a3", label: "Os Juízes" },
    8: { icon: Heart, color: "#ec4899", label: "A Lealdade" },
    9: { icon: Crown, color: "#fbbf24", label: "O Reino" },
    10: { icon: Crown, color: "#fbbf24", label: "O Reino" },
    11: { icon: Crown, color: "#f59e0b", label: "Os Reis" },
    12: { icon: Crown, color: "#b45309", label: "O Exílio" },
    13: { icon: Book, color: "#78716c", label: "A História" },
    14: { icon: Book, color: "#78716c", label: "A História" },
    15: { icon: Hammer, color: "#ea580c", label: "A Restauração" },
    16: { icon: Hammer, color: "#ea580c", label: "A Reconstrução" },
    17: { icon: Star, color: "#8b5cf6", label: "A Providência" },
    18: { icon: Shield, color: "#64748b", label: "A Provação" },
    19: { icon: Music, color: "#60a5fa", label: "O Louvor" },
    20: { icon: Lightbulb, color: "#facc15", label: "Sabedoria" },
    21: { icon: Sun, color: "#94a3b8", label: "A Vida" },
    22: { icon: Heart, color: "#ec4899", label: "O Amor" },
    23: { icon: Flame, color: "#f97316", label: "O Profeta" },
    24: { icon: Cloud, color: "#6b7280", label: "O Clamor" },
    25: { icon: Cloud, color: "#4b5563", label: "O Lamento" },
    26: { icon: Eye, color: "#8b5cf6", label: "As Visões" },
    27: { icon: Shield, color: "#ef4444", label: "A Cova" },
    28: { icon: Heart, color: "#be123c", label: "O Amor Fiel" },
    29: { icon: Sprout, color: "#65a30d", label: "O Dia do Senhor" },
    30: { icon: Gavel, color: "#dc2626", label: "A Justiça" },
    31: { icon: Mountain, color: "#7c2d12", label: "O Julgamento" },
    32: { icon: Anchor, color: "#0ea5e9", label: "O Grande Peixe" },
    33: { icon: Gavel, color: "#dc2626", label: "A Justiça" },
    34: { icon: Sword, color: "#991b1b", label: "A Ira" },
    35: { icon: Eye, color: "#d97706", label: "A Fé" },
    36: { icon: Sun, color: "#fb923c", label: "O Dia" },
    37: { icon: Hammer, color: "#ea580c", label: "O Templo" },
    38: { icon: Crown, color: "#fbbf24", label: "O Messias" },
    39: { icon: Scroll, color: "#a8a29e", label: "O Mensageiro" },
    40: { icon: Crown, color: "#ffd700", label: "O Rei" },
    41: { icon: Footprints, color: "#fb923c", label: "O Servo" },
    42: { icon: User, color: "#38bdf8", label: "O Filho do Homem" },
    43: { icon: Heart, color: "#ef4444", label: "O Filho de Deus" },
    44: { icon: Flame, color: "#ef4444", label: "O Espírito" },
    45: { icon: Shield, color: "#9ca3af", label: "A Justificação" },
    46: { icon: Users, color: "#60a5fa", label: "A Igreja" },
    47: { icon: Heart, color: "#60a5fa", label: "O Consolo" },
    48: { icon: Key, color: "#34d399", label: "A Liberdade" },
    49: { icon: Shield, color: "#60a5fa", label: "A Unidade" },
    50: { icon: Sun, color: "#facc15", label: "A Alegria" },
    51: { icon: Crown, color: "#facc15", label: "A Supremacia" },
    52: { icon: Cloud, color: "#a78bfa", label: "A Vinda" },
    53: { icon: Flame, color: "#a78bfa", label: "O Dia" },
    54: { icon: Scroll, color: "#78716c", label: "A Liderança" },
    55: { icon: Trophy, color: "#78716c", label: "O Combate" },
    56: { icon: Hammer, color: "#78716c", label: "As Boas Obras" },
    57: { icon: Heart, color: "#ec4899", label: "O Perdão" },
    58: { icon: Star, color: "#f59e0b", label: "O Sacerdote" },
    59: { icon: Hammer, color: "#10b981", label: "A Prática" },
    60: { icon: Anchor, color: "#0ea5e9", label: "A Esperança" },
    61: { icon: Lightbulb, color: "#0ea5e9", label: "O Conhecimento" },
    62: { icon: Heart, color: "#ef4444", label: "A Comunhão" },
    63: { icon: Scroll, color: "#ef4444", label: "A Verdade" },
    64: { icon: User, color: "#ef4444", label: "A Hospitalidade" },
    65: { icon: Flame, color: "#dc2626", label: "O Alerta" },
    66: { icon: Zap, color: "#8b5cf6", label: "O Alfa e Ômega" }
  };

  const defaultBadge = {
    icon: Star,
    color: "#ffd700",
    label: "Livro Completado"
  };

  return badges[id] || defaultBadge;
};