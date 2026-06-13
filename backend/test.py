from telegram import Bot
import asyncio

async def test():
    bot = Bot("8460203963:AAGS47MvVOmoPhIfVzWcgBtcHppTwrDkfek")
    me = await bot.get_me()
    print(me)

asyncio.run(test())