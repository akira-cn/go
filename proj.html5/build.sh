source ../config.sh

if [ ! -d cqwrap ]; then
    ln -s ../lib/cqwrap/js/cqwrap cqwrap
fi

if [ ! -d src ]; then
    ln -s ../Resources/src src
fi

if [ ! -d res ]; then
    ln -s ../Resources/res res
fi

if [ ! -d audio ]; then
    ln -s ../Resources/audio audio
fi

if [ ! -d lib ]; then
    ln -s "$COCOS2DH5_ROOT" lib
fi

python -m SimpleHTTPServer
