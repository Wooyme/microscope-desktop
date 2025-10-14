import {getRequestConfig} from 'next-intl/server';
 
export default getRequestConfig(async ({locale}) => {
  const uiMessages = (await import(`./messages/${locale}.json`)).default;
  const aiMessages = (await import(`./ai/messages/${locale}.json`)).default;

  return {
    messages: {
      ...uiMessages,
      ...aiMessages,
    }
  }
});
