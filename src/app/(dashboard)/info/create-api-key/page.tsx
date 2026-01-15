"use client";

import Image from "next/image";
import {
  useTranslations,
  useTranslations as useTranslationsCommon,
} from "next-intl";

export default function CreateAPIKeyInfo() {
  const t = useTranslations("info.create_key_tutorial");
  const tCommon = useTranslationsCommon("common_messages");

  if (typeof window === "undefined") return null;

  return (
    <div className="max-w-3xl mx-auto px-5">
      <h1 className="text-2xl lg:text-3xl font-bold mb-5">
        {t("create_bingx_api_key")}
      </h1>

      <h3 className="text-xl lg:text-2xl mb-4">{t("step_by_step_guide")}</h3>
      <ol className="list-decimal flex flex-col gap-8 px-4">
        <li>
          <p>
            <strong className="mr-2">{t("log_into_bingx")}:</strong>
            {t.rich("log_into_bingx_description", {
              link: (chunks) => (
                <a
                  className="text-blue-400 hover:underline"
                  href="https://bingx.com/en/accounts/info"
                  target="_blank"
                  rel="noopener"
                >
                  {chunks}
                </a>
              ),
            })}
          </p>
        </li>
        <li>
          <p>
            <strong className="mr-2">{t("go_to_api_managment")}</strong>
            {t("go_to_api_managment_description")}
          </p>
          <Image
            className="mx-auto mt-2"
            src="/images/create_api_key/1.webp"
            width={300}
            height={300}
            alt={tCommon("api_management_screenshot")}
          />
        </li>
        <li>
          <p>
            <strong className="mr-2">{t("initiate_api_key_creation")}</strong>
            {t("initiate_api_key_creation_description")}
          </p>
          <Image
            className="mx-auto mt-2"
            src="/images/create_api_key/2.png"
            width={500}
            height={450}
            alt={tCommon("api_key_creation_screenshot")}
          />
        </li>
        <li>
          <p>
            <strong>{t("config_and_create_your_api_key")}:</strong>
          </p>
          <ul className="list-disc ml-4 mt-2">
            <li>
              <p className="uppercase">{t("only_read_permission_needed")}</p>
            </li>
            <li>
              <p>
                {t.rich("add_ip_whitelisting", {
                  link: (chunks) => (
                    <a
                      className="text-blue-400 hover:underline"
                      href={`https://www.nslookup.io/domains/${window?.location?.hostname || ""}/webservers/`}
                      target="_blank"
                    >
                      {chunks}
                    </a>
                  ),
                })}
              </p>
            </li>
            <li>
              <p>{t("complete_verification_steps_to_continue")}</p>
            </li>
          </ul>
          <Image
            className="mx-auto mt-2"
            src="/images/create_api_key/3.png"
            width={500}
            height={450}
            alt={tCommon("api_configuration_screenshot")}
          />
        </li>
        <li>
          <p>
            <strong className="mr-2">{t("copy_api_and_secret_key")}</strong>
            {t.rich("copy_api_and_secret_key_description", {
              strong: (chunks) => (
                <strong className="uppercase">{chunks}</strong>
              ),
            })}
          </p>
          <Image
            className="mx-auto mt-2"
            src="/images/create_api_key/4.webp"
            width={500}
            height={450}
            alt={tCommon("api_configuration_screenshot")}
          />
        </li>
      </ol>
    </div>
  );
}
