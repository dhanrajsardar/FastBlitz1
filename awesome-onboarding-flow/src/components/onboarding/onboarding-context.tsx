import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useReducer,
  type Dispatch,
  type ReactNode,
} from "react";

export type BrandMode = "website" | "description";

export type OnboardingData = {
  name: string;
  companyName: string;
  logoDataUrl: string | null;
  logoFileName: string | null;
  brandMode: BrandMode;
  website: string;
  description: string;
  analysed: boolean;
  teamSize: string;
  revenue: string;
  role: string;
  businessModel: string;
  categories: string[];
  signupReason: string;
  expectations: string[];
};

export const initialData: OnboardingData = {
  name: "",
  companyName: "",
  logoDataUrl: null,
  logoFileName: null,
  brandMode: "website",
  website: "",
  description: "",
  analysed: false,
  teamSize: "",
  revenue: "",
  role: "",
  businessModel: "",
  categories: [],
  signupReason: "",
  expectations: [],
};

type State = {
  data: OnboardingData;
  step: number;
  direction: 1 | -1;
  phase: "steps" | "building" | "done";
};

type Action =
  | { type: "set"; patch: Partial<OnboardingData> }
  | { type: "toggle"; key: "categories" | "expectations"; value: string }
  | { type: "next"; total: number }
  | { type: "back" }
  | { type: "goto"; step: number }
  | { type: "finishBuilding" }
  | { type: "reset" };

const TOTAL_STEPS = 7;

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case "set":
      return { ...state, data: { ...state.data, ...action.patch } };
    case "toggle": {
      const current = state.data[action.key];
      const next = current.includes(action.value)
        ? current.filter((v) => v !== action.value)
        : [...current, action.value];
      return { ...state, data: { ...state.data, [action.key]: next } };
    }
    case "next":
      if (state.step >= action.total) {
        return { ...state, phase: "building", direction: 1 };
      }
      return { ...state, step: state.step + 1, direction: 1 };
    case "back":
      if (state.step === 1) return state;
      return { ...state, step: state.step - 1, direction: -1 };
    case "goto":
      return {
        ...state,
        phase: "steps",
        direction: action.step > state.step ? 1 : -1,
        step: action.step,
      };
    case "finishBuilding":
      return { ...state, phase: "done" };
    case "reset":
      return { data: initialData, step: 1, direction: 1, phase: "steps" };
    default:
      return state;
  }
}

type Ctx = {
  state: State;
  dispatch: Dispatch<Action>;
  totalSteps: number;
  set: (patch: Partial<OnboardingData>) => void;
  toggle: (key: "categories" | "expectations", value: string) => void;
  next: () => void;
  back: () => void;
  canContinue: boolean;
};

const OnboardingContext = createContext<Ctx | null>(null);

export function isValidUrl(value: string) {
  const trimmed = value.trim().replace(/^https?:\/\//i, "");
  return /^[a-z0-9-]+(\.[a-z0-9-]+)+(\/\S*)?$/i.test(trimmed);
}

export const MIN_DESCRIPTION = 60;

export function stepIsComplete(step: number, d: OnboardingData): boolean {
  switch (step) {
    case 1:
      return d.name.trim().length > 1 && d.companyName.trim().length > 1;
    case 2:
      return d.brandMode === "website" ? isValidUrl(d.website) : true;
    case 3:
      return d.description.trim().length >= MIN_DESCRIPTION;
    case 4:
      return d.teamSize !== "" && d.revenue !== "";
    case 5:
      return d.role !== "";
    case 6:
      return d.businessModel !== "" && d.categories.length > 0;
    case 7:
      return d.signupReason !== "" && d.expectations.length > 0;
    default:
      return false;
  }
}

export function OnboardingProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, {
    data: initialData,
    step: 1,
    direction: 1 as const,
    phase: "steps" as const,
  });

  const set = useCallback(
    (patch: Partial<OnboardingData>) => dispatch({ type: "set", patch }),
    [],
  );
  const toggle = useCallback(
    (key: "categories" | "expectations", value: string) =>
      dispatch({ type: "toggle", key, value }),
    [],
  );
  const next = useCallback(() => dispatch({ type: "next", total: TOTAL_STEPS }), []);
  const back = useCallback(() => dispatch({ type: "back" }), []);

  const canContinue = stepIsComplete(state.step, state.data);

  const value = useMemo<Ctx>(
    () => ({ state, dispatch, totalSteps: TOTAL_STEPS, set, toggle, next, back, canContinue }),
    [state, set, toggle, next, back, canContinue],
  );

  return <OnboardingContext.Provider value={value}>{children}</OnboardingContext.Provider>;
}

export function useOnboarding() {
  const ctx = useContext(OnboardingContext);
  if (!ctx) throw new Error("useOnboarding must be used inside OnboardingProvider");
  return ctx;
}

export const STEP_LABELS = [
  "Welcome",
  "Website",
  "Company",
  "About you",
  "Your role",
  "Business",
  "Goals",
];
