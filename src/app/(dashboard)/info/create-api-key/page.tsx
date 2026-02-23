"use client";

import Image from "next/image";
import {
  useTranslations,
  useTranslations as useTranslationsCommon,
} from "next-intl";
import { motion } from "motion/react";
import { useEffect, useState } from "react";

export default function CreateAPIKeyInfo() {
  const t = useTranslations("info.create_key_tutorial");
  const tCommon = useTranslationsCommon("common_messages");
  const [hostname, setHostname] = useState("");

  useEffect(() => {
    setHostname(window.location.hostname);
  }, []);

  return (
    <div className="max-w-4xl mx-auto px-6 py-12">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-12"
      >
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent/50 border border-border mb-6">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-primary" />
          </span>
          <span className="text-sm font-medium text-muted-foreground">
            {t("step_by_step_guide")}
          </span>
        </div>
        <h1 className="text-3xl lg:text-4xl font-bold text-foreground">
          {t("create_bingx_api_key")}
        </h1>
      </motion.div>

      {/* Steps */}
      <div className="relative">
        {/* Connection line */}
        <div className="absolute left-8 top-8 bottom-0 w-px bg-gradient-to-b from-border via-border to-transparent hidden lg:block" />

        <ol className="space-y-8">
          {/* Step 1 */}
          <motion.li
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="relative flex gap-6"
          >
            <StepNumber number={1} />
            <StepContent>
              <p className="text-lg">
                <span className="font-semibold text-foreground">
                  {t("log_into_bingx")}
                </span>
                <span className="text-muted-foreground">:</span>
                {t.rich("log_into_bingx_description", {
                  link: (chunks) => (
                    <a
                      className="text-primary hover:text-primary/80 underline underline-offset-4 decoration-primary/30 transition-colors inline-flex items-center gap-1"
                      href="https://bingx.com/en/accounts/info"
                      target="_blank"
                      rel="noopener"
                    >
                      {chunks}
                      <ExternalLinkIcon />
                    </a>
                  ),
                })}
              </p>
            </StepContent>
          </motion.li>

          {/* Step 2 */}
          <motion.li
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="relative flex gap-6"
          >
            <StepNumber number={2} />
            <StepContent>
              <p className="text-lg mb-4">
                <span className="font-semibold text-foreground">
                  {t("go_to_api_managment")}
                </span>
                <span className="text-muted-foreground">:</span>
                <span className="text-muted-foreground ml-2">
                  {t("go_to_api_managment_description")}
                </span>
              </p>
              <StepImage
                src="/images/create_api_key/1.webp"
                width={600}
                height={400}
                alt={tCommon("api_management_screenshot")}
                delay={0.3}
              />
            </StepContent>
          </motion.li>

          {/* Step 3 */}
          <motion.li
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="relative flex gap-6"
          >
            <StepNumber number={3} />
            <StepContent>
              <p className="text-lg mb-4">
                <span className="font-semibold text-foreground">
                  {t("initiate_api_key_creation")}
                </span>
                <span className="text-muted-foreground">:</span>
                <span className="text-muted-foreground ml-2">
                  {t("initiate_api_key_creation_description")}
                </span>
              </p>
              <StepImage
                src="/images/create_api_key/2.png"
                width={700}
                height={500}
                alt={tCommon("api_key_creation_screenshot")}
                delay={0.4}
              />
            </StepContent>
          </motion.li>

          {/* Step 4 */}
          <motion.li
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="relative flex gap-6"
          >
            <StepNumber number={4} />
            <StepContent>
              <p className="text-lg mb-4 font-semibold text-foreground">
                {t("config_and_create_your_api_key")}
              </p>
              <ul className="space-y-3 mb-6">
                <li className="flex items-start gap-3">
                  <CheckIcon />
                  <span className="text-muted-foreground uppercase text-sm tracking-wide">
                    {t("only_read_permission_needed")}
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckIcon />
                  <span className="text-muted-foreground">
                    {t.rich("add_ip_whitelisting", {
                      link: (chunks) => (
                        <a
                          className="text-primary hover:text-primary/80 underline underline-offset-4 decoration-primary/30 transition-colors inline-flex items-center gap-1"
                          href={`https://www.nslookup.io/domains/${hostname}/webservers/`}
                          target="_blank"
                        >
                          {chunks}
                          <ExternalLinkIcon />
                        </a>
                      ),
                    })}
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckIcon />
                  <span className="text-muted-foreground">
                    {t("complete_verification_steps_to_continue")}
                  </span>
                </li>
              </ul>
              <StepImage
                src="/images/create_api_key/3.png"
                width={700}
                height={500}
                alt={tCommon("api_configuration_screenshot")}
                delay={0.5}
              />
            </StepContent>
          </motion.li>

          {/* Step 5 */}
          <motion.li
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.5 }}
            className="relative flex gap-6"
          >
            <StepNumber number={5} />
            <StepContent>
              <p className="text-lg mb-4">
                <span className="font-semibold text-foreground">
                  {t("copy_api_and_secret_key")}
                </span>
                <span className="text-muted-foreground">:</span>
                {t.rich("copy_api_and_secret_key_description", {
                  strong: (chunks) => (
                    <span className="text-amber-500 font-bold uppercase tracking-wide">
                      {chunks}
                    </span>
                  ),
                })}
              </p>
              <StepImage
                src="/images/create_api_key/4.webp"
                width={700}
                height={500}
                alt={tCommon("api_configuration_screenshot")}
                delay={0.6}
              />
            </StepContent>
          </motion.li>
        </ol>
      </div>
    </div>
  );
}

function StepNumber({ number }: { number: number }) {
  return (
    <div className="flex-shrink-0">
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{
          duration: 0.4,
          delay: 0.1 * number,
          type: "spring",
          stiffness: 200,
        }}
        className="relative z-10 flex items-center justify-center w-16 h-16 rounded-2xl bg-primary shadow-lg shadow-primary/25 border border-border"
      >
        <span className="text-2xl font-bold text-primary-foreground">
          {number}
        </span>
        <div className="absolute inset-0 rounded-2xl bg-white/10 blur-sm" />
      </motion.div>
    </div>
  );
}

function StepContent({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex-1 pt-2 pb-4 px-6 rounded-2xl bg-muted/30 border border-border hover:border-ring transition-colors duration-300">
      {children}
    </div>
  );
}

function StepImage({
  src,
  width,
  height,
  alt,
  delay,
}: {
  src: string;
  width: number;
  height: number;
  alt: string;
  delay: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.6, delay }}
      className="relative group"
    >
      <div className="absolute -inset-0.5 bg-gradient-to-r from-primary/20 to-accent/20 rounded-2xl blur opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      <div className="relative rounded-2xl overflow-hidden border border-border bg-muted/30 shadow-2xl">
        <Image
          src={src}
          width={width}
          height={height}
          alt={alt}
          className="w-full h-auto"
          sizes="(max-width: 768px) 100vw, 700px"
        />
      </div>
    </motion.div>
  );
}

function CheckIcon() {
  return (
    <svg
      className="w-5 h-5 text-primary flex-shrink-0 mt-0.5"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2.5}
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
    </svg>
  );
}

function ExternalLinkIcon() {
  return (
    <svg
      className="w-4 h-4 inline-flex"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
      />
    </svg>
  );
}
