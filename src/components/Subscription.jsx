import React, { useEffect, useMemo, useState } from "react";
import { useAuth } from "../context/AuthContext";
import Header from "./Header";
import Sidebar from "./Sidebar";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../firebase";
import {
  Check,
  ChevronDown,
  CreditCard,
  Crown,
  Globe,
  Sparkles,
  Users,
  BarChart3,
  Headphones,
  Code2,
  ShieldCheck,
  Zap,
  ArrowUpRight,
  Receipt,
  LockKeyhole,
  CircleCheck,
  Loader2,
  X,
  BadgeIndianRupee,
} from "lucide-react";

const PAYMENT_API_URL =
  import.meta.env.VITE_PAYMENT_API_URL || "http://localhost:5001";
const RAZORPAY_KEY_ID = import.meta.env.VITE_RAZORPAY_KEY_ID || "";

const currencies = {
  INR: {
    symbol: "₹",
    name: "Indian Rupee",
    pro: 2499,
    enterprise: "Custom",
  },
  USD: {
    symbol: "$",
    name: "US Dollar",
    pro: 29,
    enterprise: "Custom",
  },
  EUR: {
    symbol: "€",
    name: "Euro",
    pro: 25,
    enterprise: "Custom",
  },
  GBP: {
    symbol: "£",
    name: "British Pound",
    pro: 22,
    enterprise: "Custom",
  },
};

const plans = [
  {
    id: "free",
    name: "Free",
    eyebrow: "For getting started",
    description: "Everything you need to run a small workspace.",
    icon: Sparkles,
    accent: "gray",
    features: [
      { text: "Up to 5 users", icon: Users },
      { text: "Basic analytics", icon: BarChart3 },
      { text: "Community support", icon: Headphones },
      { text: "API access", icon: Code2, included: false },
      { text: "Advanced features", icon: ShieldCheck, included: false },
    ],
  },
  {
    id: "pro",
    name: "Pro",
    eyebrow: "For growing teams",
    description: "More power, deeper analytics and automation for serious teams.",
    icon: Crown,
    popular: true,
    accent: "blue",
    features: [
      { text: "Up to 50 users", icon: Users },
      { text: "Advanced analytics", icon: BarChart3 },
      { text: "Priority support", icon: Headphones },
      { text: "API access", icon: Code2 },
      { text: "Advanced features", icon: ShieldCheck },
    ],
  },
  {
    id: "enterprise",
    name: "Enterprise",
    eyebrow: "For larger organizations",
    description: "Custom controls, integrations and support for complex teams.",
    icon: ShieldCheck,
    accent: "purple",
    features: [
      { text: "Unlimited users", icon: Users },
      { text: "Custom analytics", icon: BarChart3 },
      { text: "Dedicated support", icon: Headphones },
      { text: "Custom integrations", icon: Code2 },
      { text: "Enterprise security", icon: ShieldCheck },
    ],
  },
];

const loadRazorpayScript = () =>
  new Promise((resolve) => {
    if (window.Razorpay) {
      resolve(true);
      return;
    }

    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });

const getDemoSubscription = (workspaceId) => {
  if (!workspaceId) return null;

  try {
    const raw = localStorage.getItem(`nexusflow-subscription-${workspaceId}`);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

const saveDemoSubscription = (workspaceId, value) => {
  if (!workspaceId) return;
  localStorage.setItem(
    `nexusflow-subscription-${workspaceId}`,
    JSON.stringify(value)
  );
};

const getDemoPayments = (workspaceId) => {
  if (!workspaceId) return [];

  try {
    const raw = localStorage.getItem(`nexusflow-payments-${workspaceId}`);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};

const saveDemoPayment = (workspaceId, payment) => {
  const payments = getDemoPayments(workspaceId);
  const next = [payment, ...payments].slice(0, 5);
  localStorage.setItem(`nexusflow-payments-${workspaceId}`, JSON.stringify(next));
  return next;
};

export default function Subscription() {
  const { user, userRole, workspaceId, logout } = useAuth();

  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currency, setCurrency] = useState("INR");
  const [currencyOpen, setCurrencyOpen] = useState(false);
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [toast, setToast] = useState(null);
  const [demoSubscription, setDemoSubscription] = useState(null);
  const [payments, setPayments] = useState([]);

  useEffect(() => {
    fetchUserData();
  }, [user]);

  useEffect(() => {
    if (!workspaceId) return;
    setDemoSubscription(getDemoSubscription(workspaceId));
    setPayments(getDemoPayments(workspaceId));
  }, [workspaceId]);

  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(null), 4500);
    return () => clearTimeout(timer);
  }, [toast]);

  const fetchUserData = async () => {
    if (!user) return;

    try {
      const userDoc = await getDoc(doc(db, "users", user.uid));

      if (userDoc.exists()) {
        setUserData(userDoc.data());
      }
    } catch (error) {
      console.error("Error fetching user data:", error);
      setToast({ type: "error", message: "Unable to load billing details." });
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await logout();
  };

  const selectedCurrency = currencies[currency];
  const currentPlan =
    demoSubscription?.plan || userData?.plan?.toLowerCase() || "free";
  const isPro = currentPlan === "pro";

  const formatPrice = (planId) => {
    if (planId === "free") return `${selectedCurrency.symbol}0`;
    if (planId === "enterprise") return selectedCurrency.enterprise;

    return `${selectedCurrency.symbol}${selectedCurrency.pro.toLocaleString(
      "en-IN"
    )}`;
  };

  const currentPlanDetails = useMemo(
    () => plans.find((plan) => plan.id === currentPlan) || plans[0],
    [currentPlan]
  );

  const showToast = (type, message) => setToast({ type, message });

  const handleProCheckout = async () => {
    if (isPro) return;

    if (currency !== "INR") {
      showToast(
        "error",
        "Razorpay demo checkout is currently enabled for INR only."
      );
      return;
    }

    if (!RAZORPAY_KEY_ID) {
      showToast(
        "error",
        "Razorpay test key is missing. Add VITE_RAZORPAY_KEY_ID to .env.local."
      );
      return;
    }

    setCheckoutLoading(true);

    try {
      const loaded = await loadRazorpayScript();
      if (!loaded) {
        throw new Error("Razorpay Checkout could not be loaded.");
      }

      const orderResponse = await fetch(
        `${PAYMENT_API_URL}/api/payments/create-order`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            amount: selectedCurrency.pro * 100,
            currency: "INR",
            workspaceId,
            userId: user?.uid,
            email: user?.email,
            plan: "pro",
          }),
        }
      );

      const orderResult = await orderResponse.json();

      if (!orderResponse.ok) {
        throw new Error(orderResult.message || "Unable to create payment order.");
      }

      const options = {
        key: RAZORPAY_KEY_ID,
        amount: orderResult.amount,
        currency: orderResult.currency,
        name: "NexusFlow",
        description: "NexusFlow Pro — Test Checkout",
        order_id: orderResult.orderId,
        prefill: {
          name: user?.displayName || userData?.name || "NexusFlow User",
          email: user?.email || "",
        },
        notes: {
          workspaceId: workspaceId || "",
          plan: "pro",
          environment: "test",
        },
        theme: {
          color: "#2563eb",
        },
        modal: {
          ondismiss: () => setCheckoutLoading(false),
        },
        handler: async (response) => {
          try {
            const verifyResponse = await fetch(
              `${PAYMENT_API_URL}/api/payments/verify`,
              {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  ...response,
                  workspaceId,
                  userId: user?.uid,
                  plan: "pro",
                  amount: orderResult.amount,
                  currency: orderResult.currency,
                }),
              }
            );

            const verifyResult = await verifyResponse.json();

            if (!verifyResponse.ok || !verifyResult.verified) {
              throw new Error(
                verifyResult.message || "Payment verification failed."
              );
            }

            const subscription = {
              plan: "pro",
              status: "active",
              paymentId: response.razorpay_payment_id,
              orderId: response.razorpay_order_id,
              amount: orderResult.amount,
              currency: orderResult.currency,
              activatedAt: new Date().toISOString(),
              demo: true,
            };

            saveDemoSubscription(workspaceId, subscription);
            setDemoSubscription(subscription);

            const nextPayments = saveDemoPayment(workspaceId, {
              id: response.razorpay_payment_id,
              orderId: response.razorpay_order_id,
              amount: orderResult.amount,
              currency: orderResult.currency,
              status: "captured",
              createdAt: new Date().toISOString(),
            });

            setPayments(nextPayments);
            setCheckoutLoading(false);
            showToast(
              "success",
              "Pro activated successfully in Razorpay Test Mode."
            );
          } catch (error) {
            console.error("Payment verification error:", error);
            setCheckoutLoading(false);
            showToast(
              "error",
              error.message || "Payment verification failed."
            );
          }
        },
      };

      const razorpay = new window.Razorpay(options);

      razorpay.on("payment.failed", (response) => {
        console.error("Razorpay payment failed:", response.error);
        setCheckoutLoading(false);
        showToast(
          "error",
          response.error?.description || "The test payment failed."
        );
      });

      razorpay.open();
    } catch (error) {
      console.error("Razorpay checkout error:", error);
      setCheckoutLoading(false);
      showToast("error", error.message || "Unable to start checkout.");
    }
  };

  const handleEnterprise = () => {
    showToast("success", "Enterprise contact flow is ready for the next phase.");
  };

  if (loading) {
    return (
      <div className="flex h-screen bg-[#060B14]">
        <Sidebar userRole={userRole} />
        <div className="flex-1 flex flex-col">
          <Header user={userData} userRole={userRole} onLogout={handleLogout} />
          <div className="flex items-center justify-center flex-1">
            <div className="h-10 w-10 rounded-full border-2 border-white/10 border-t-blue-500 animate-spin" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-[#060B14] text-white">
      <Sidebar userRole={userRole} />

      <div className="flex-1 flex flex-col min-w-0">
        <Header user={userData} userRole={userRole} onLogout={handleLogout} />

        <main className="flex-1 overflow-auto nexus-scroll">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-7 lg:py-9">
            

            {/* Header */}
            <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6 mb-8">
              <div>
                <div className="flex items-center gap-2 text-blue-400 text-sm font-medium mb-3">
                  <CreditCard size={16} />
                  Billing & Subscription
                </div>
                <h1 className="text-3xl md:text-4xl font-bold tracking-tight">
                  Plans that scale with your workspace
                </h1>
                <p className="text-gray-400 mt-3 max-w-2xl leading-6">
                  Upgrade your workspace when you need more users, analytics,
                  integrations and advanced capabilities.
                </p>
              </div>

              {/* Currency selector */}
              <div className="relative shrink-0">
                <button
                  onClick={() => setCurrencyOpen(!currencyOpen)}
                  className="flex items-center gap-3 px-4 py-3 rounded-xl border border-white/10 bg-white/[0.04] hover:bg-white/[0.07] transition min-w-[205px]"
                >
                  <Globe size={18} className="text-blue-400" />
                  <div className="flex-1 text-left">
                    <p className="text-[11px] text-gray-500 uppercase tracking-wider">
                      Display currency
                    </p>
                    <p className="text-sm font-semibold">
                      {currency} · {selectedCurrency.name}
                    </p>
                  </div>
                  <ChevronDown
                    size={17}
                    className={`text-gray-400 transition ${
                      currencyOpen ? "rotate-180" : ""
                    }`}
                  />
                </button>

                {currencyOpen && (
                  <div className="absolute right-0 top-full mt-2 w-[225px] bg-[#101722] border border-white/10 rounded-xl shadow-2xl overflow-hidden z-50">
                    {Object.entries(currencies).map(([code, currencyInfo]) => (
                      <button
                        key={code}
                        onClick={() => {
                          setCurrency(code);
                          setCurrencyOpen(false);
                        }}
                        className={`w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-white/[0.06] transition ${
                          currency === code
                            ? "bg-blue-500/10 text-blue-400"
                            : "text-gray-300"
                        }`}
                      >
                        <span className="w-8 h-8 rounded-lg bg-white/[0.06] flex items-center justify-center font-semibold">
                          {currencyInfo.symbol}
                        </span>
                        <div>
                          <p className="text-sm font-semibold">{code}</p>
                          <p className="text-xs text-gray-500">
                            {currencyInfo.name}
                          </p>
                        </div>
                        {currency === code && (
                          <Check size={16} className="ml-auto" />
                        )}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Current plan */}
            <section className="relative overflow-hidden mb-8 rounded-2xl border border-white/10 bg-gradient-to-br from-blue-500/[0.09] via-white/[0.025] to-purple-500/[0.05] p-5 sm:p-6">
              <div className="absolute -right-16 -top-20 w-56 h-56 rounded-full bg-blue-500/10 blur-3xl pointer-events-none" />
              <div className="relative flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-blue-500/10 border border-blue-400/10 text-blue-400 flex items-center justify-center shrink-0">
                    <Crown size={21} />
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-wider text-gray-500 mb-2">
                      Current workspace plan
                    </p>
                    <div className="flex flex-wrap items-center gap-3">
                      <h2 className="text-xl font-bold">
                        {currentPlanDetails.name}
                      </h2>
                      <span className="px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-400/10 text-emerald-400 text-xs font-semibold">
                        Active
                      </span>
                      {demoSubscription?.demo && (
                        <span className="px-2.5 py-1 rounded-full bg-blue-500/10 border border-blue-400/10 text-blue-300 text-xs font-semibold">
                          Razorpay Test
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-500 mt-2">
                      {isPro
                        ? "Your workspace is using the Pro demo entitlement."
                        : "Your workspace is currently on the free plan."}
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap gap-3">
                  <div className="px-4 py-3 rounded-xl border border-white/10 bg-black/10 min-w-[135px]">
                    <p className="text-[10px] uppercase tracking-wider text-gray-600">
                      Workspace
                    </p>
                    <p className="text-sm font-semibold text-gray-300 mt-1 truncate max-w-[150px]">
                      {workspaceId ? `${workspaceId.slice(0, 8)}…` : "—"}
                    </p>
                  </div>
                  <button
                    className="px-5 py-3 rounded-xl border border-white/10 text-sm font-semibold text-gray-300 hover:bg-white/[0.06] transition"
                    onClick={() =>
                      showToast(
                        "success",
                        "Billing management is available through the plan actions below."
                      )
                    }
                  >
                    Manage Billing
                  </button>
                </div>
              </div>
            </section>

            {/* Plans */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 xl:gap-6 items-stretch">
              {plans.map((plan) => {
                const Icon = plan.icon;
                const isCurrent = currentPlan === plan.id;

                return (
                  <div
                    key={plan.id}
                    className={`relative rounded-2xl p-[1px] transition duration-300 hover:-translate-y-1 ${
                      plan.popular
                        ? "bg-gradient-to-b from-blue-500 via-indigo-500/70 to-blue-500/10"
                        : "bg-white/[0.08]"
                    }`}
                  >
                    {plan.popular && (
                      <div className="absolute top-0 right-6 -translate-y-1/2 z-10">
                        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-blue-500 text-white text-[11px] font-bold shadow-lg shadow-blue-500/20">
                          <Zap size={12} fill="currentColor" /> MOST POPULAR
                        </span>
                      </div>
                    )}

                    <div
                      className={`h-full rounded-2xl p-6 sm:p-7 flex flex-col ${
                        plan.popular ? "bg-[#0D1420]" : "bg-[#0A111C]"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div
                          className={`w-11 h-11 rounded-xl flex items-center justify-center ${
                            plan.popular
                              ? "bg-blue-500/15 text-blue-400"
                              : "bg-white/[0.06] text-gray-300"
                          }`}
                        >
                          <Icon size={21} />
                        </div>
                        {isCurrent && (
                          <span className="px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 text-[11px] font-semibold">
                            Current
                          </span>
                        )}
                      </div>

                      <p className="text-[11px] uppercase tracking-[0.16em] text-gray-600 font-semibold mt-5">
                        {plan.eyebrow}
                      </p>
                      <h2 className="text-2xl font-bold mt-2">{plan.name}</h2>
                      <p className="text-sm text-gray-500 mt-2 min-h-[42px] leading-5">
                        {plan.description}
                      </p>

                      <div className="mt-7 mb-6">
                        <div className="flex items-end gap-2">
                          <span className="text-4xl font-bold tracking-tight">
                            {formatPrice(plan.id)}
                          </span>
                          {plan.id !== "enterprise" && (
                            <span className="text-sm text-gray-500 mb-1">
                              / month
                            </span>
                          )}
                        </div>
                        {plan.id === "pro" && (
                          <p className="text-xs text-gray-600 mt-2">
                            Cancel anytime · Test checkout available in INR
                          </p>
                        )}
                        {plan.id === "enterprise" && (
                          <p className="text-xs text-gray-500 mt-2">
                            Talk to our sales team for custom pricing.
                          </p>
                        )}
                      </div>

                      <button
                        className={`w-full py-3.5 rounded-xl font-semibold text-sm transition mb-7 flex items-center justify-center gap-2 ${
                          isCurrent
                            ? "bg-emerald-500/10 text-emerald-400 border border-emerald-400/10 cursor-default"
                            : plan.id === "pro"
                              ? "bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-600/20"
                              : plan.id === "enterprise"
                                ? "border border-white/10 hover:bg-white/[0.06] text-white"
                                : "bg-white/[0.07] text-gray-500 cursor-default"
                        }`}
                        disabled={isCurrent || plan.id === "free" || checkoutLoading}
                        onClick={() => {
                          if (plan.id === "pro") handleProCheckout();
                          if (plan.id === "enterprise") handleEnterprise();
                        }}
                      >
                        {checkoutLoading && plan.id === "pro" ? (
                          <>
                            <Loader2 size={16} className="animate-spin" />
                            Opening secure checkout…
                          </>
                        ) : isCurrent ? (
                          <>
                            <CircleCheck size={16} /> Current Plan
                          </>
                        ) : plan.id === "free" ? (
                          "Free Plan"
                        ) : plan.id === "pro" ? (
                          <>
                            Upgrade to Pro <ArrowUpRight size={16} />
                          </>
                        ) : (
                          <>
                            Contact Sales <ArrowUpRight size={16} />
                          </>
                        )}
                      </button>

                      <div className="border-t border-white/[0.07] pt-6 mt-auto">
                        <p className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-4">
                          What's included
                        </p>

                        <div className="space-y-3.5">
                          {plan.features.map((feature, index) => {
                            const FeatureIcon = feature.icon;
                            const included = feature.included !== false;

                            return (
                              <div
                                key={index}
                                className={`flex items-center gap-3 text-sm ${
                                  included ? "text-gray-300" : "text-gray-600"
                                }`}
                              >
                                {included ? (
                                  <div className="w-5 h-5 rounded-full bg-emerald-500/10 text-emerald-400 flex items-center justify-center shrink-0">
                                    <Check size={13} />
                                  </div>
                                ) : (
                                  <div className="w-5 h-5 rounded-full bg-white/[0.04] flex items-center justify-center text-xs shrink-0">
                                    ×
                                  </div>
                                )}
                                <FeatureIcon
                                  size={15}
                                  className={
                                    included ? "text-gray-500" : "text-gray-700"
                                  }
                                />
                                <span>{feature.text}</span>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Payment history */}
            <section className="mt-8 rounded-2xl border border-white/10 bg-white/[0.025] overflow-hidden">
              <div className="px-5 sm:px-6 py-5 border-b border-white/[0.07] flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <Receipt size={17} className="text-blue-400" />
                    <h2 className="font-semibold">Recent payments</h2>
                  </div>
                  <p className="text-xs text-gray-600 mt-1">
                    Test transactions from this workspace.
                  </p>
                </div>
                <span className="text-[11px] uppercase tracking-wider text-gray-600">
                  Razorpay Sandbox
                </span>
              </div>

              {payments.length === 0 ? (
                <div className="px-6 py-10 text-center">
                  <div className="mx-auto w-10 h-10 rounded-xl bg-white/[0.04] text-gray-600 flex items-center justify-center mb-3">
                    <Receipt size={18} />
                  </div>
                  <p className="text-sm text-gray-400">No payments yet</p>
                  <p className="text-xs text-gray-600 mt-1">
                    Your successful Razorpay test transactions will appear here.
                  </p>
                </div>
              ) : (
                <div className="divide-y divide-white/[0.06]">
                  {payments.map((payment) => (
                    <div
                      key={payment.id}
                      className="px-5 sm:px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center shrink-0">
                          <Check size={16} />
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-gray-300 truncate">
                            Pro workspace upgrade
                          </p>
                          <p className="text-xs text-gray-600 mt-0.5 truncate">
                            {payment.id} · {new Date(payment.createdAt).toLocaleString()}
                          </p>
                        </div>
                      </div>
                      <div className="text-left sm:text-right shrink-0">
                        <p className="text-sm font-semibold text-gray-200">
                          ₹{(payment.amount / 100).toLocaleString("en-IN")}
                        </p>
                        <p className="text-[11px] text-emerald-400 capitalize">
                          {payment.status}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>

            {/* Trust / info */}
            <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-5 rounded-2xl bg-white/[0.03] border border-white/[0.07]">
                <LockKeyhole className="text-blue-400 mb-3" size={20} />
                <h3 className="font-semibold">Secure checkout</h3>
                <p className="text-sm text-gray-500 mt-1 leading-5">
                  Checkout is handled by Razorpay. Payment signatures are
                  verified by the NexusFlow backend before activation.
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-white/[0.03] border border-white/[0.07]">
                <ShieldCheck className="text-emerald-400 mb-3" size={20} />
                <h3 className="font-semibold">Workspace billing</h3>
                <p className="text-sm text-gray-500 mt-1 leading-5">
                  Plans are designed around the workspace, so one upgrade can
                  cover the entire team.
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-white/[0.03] border border-white/[0.07]">
                <Zap className="text-purple-400 mb-3" size={20} />
                <h3 className="font-semibold">Built for integrations</h3>
                <p className="text-sm text-gray-500 mt-1 leading-5">
                  Pro unlocks the product capabilities that make NexusFlow
                  useful as a modern SaaS platform.
                </p>
              </div>
            </div>

            <p className="text-center text-[11px] text-gray-700 mt-7 pb-2">
              NexusFlow billing demo · No real money is charged while using
              Razorpay Test Mode.
            </p>
          </div>
        </main>
      </div>

      {toast && (
        <div className="fixed right-5 bottom-5 z-[100] w-[min(380px,calc(100vw-40px))]">
          <div
            className={`flex items-start gap-3 rounded-2xl border px-4 py-3.5 shadow-2xl backdrop-blur-xl ${
              toast.type === "success"
                ? "border-emerald-400/15 bg-[#0b1815]/95"
                : "border-red-400/15 bg-[#1b1013]/95"
            }`}
          >
            <div
              className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                toast.type === "success"
                  ? "bg-emerald-500/10 text-emerald-400"
                  : "bg-red-500/10 text-red-400"
              }`}
            >
              {toast.type === "success" ? (
                <Check size={16} />
              ) : (
                <X size={16} />
              )}
            </div>
            <p className="text-sm text-gray-300 leading-5 flex-1">
              {toast.message}
            </p>
            <button
              onClick={() => setToast(null)}
              className="text-gray-600 hover:text-gray-300 transition"
            >
              <X size={15} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}