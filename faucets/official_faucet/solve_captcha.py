import sys
import os
import json

sys.path.append(os.path.dirname(os.path.dirname(os.path.realpath(__file__))))

from twocaptcha import TwoCaptcha

api_key = 'YOUR_2CAPTCHA_API'

solver = TwoCaptcha(api_key)

try:
    result = solver.recaptcha(
        sitekey='6LerLrcqAAAAAFSznddAF6KufR5mW4jsrfMYvjg1',
        url='https://testnet.monad.xyz/'
    )
except Exception as e:
    print(json.dumps({"error": str(e)}))
    sys.exit(1)
else:
    print(json.dumps(result))
