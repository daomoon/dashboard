import { FetchResource } from './fetch-resource'
import { settingsStore } from '@/stores/settings-store'
import { exchangeRatesStore } from './exchange-rates-store'
import { computed, makeObservable } from 'mobx'
import BigNumber from 'bignumber.js'
import { appStore } from '@/stores/app-store'
import { EthereumService } from '@/services/EthereumService'
import { BSCService } from '@/services/BSCService'
import { IAssetsInfo } from '@/types'

export class AssetsStore extends FetchResource<any> {
  private readonly settingsStore = settingsStore

  private readonly exchangeRatesStore = exchangeRatesStore

  constructor() {
    super()
    makeObservable(this)
  }

  @computed
  get stakedBalance() {
    // TODO fix exchangeRatesStore
    // if (this.value === null || this.exchangeRatesStore.value === null) {
    if (this.value === null) {
      return new BigNumber(0)
    }

    // const baseCurrency = this.settingsStore.settings.currency.value
    // const currentExchangeRate = this.exchangeRatesStore.value[baseCurrency]

    return this.value.reduce((acc: BigNumber, currentAsset: IAssetsInfo) => {
      const currentAssetValue = currentAsset.value ?? new BigNumber(0)
      return acc.plus(currentAssetValue)
    }, new BigNumber(0))
    // TODO fix currentExchangeRate
    // .multipliedBy(currentExchangeRate)
  }

  protected fetchFn = async () => {
    if (!appStore.address) {
      console.warn('[AssetsStore.fetchFn] address must be defined')
      return
    }

    const [ethereumAssets, BSCAssets] = await Promise.all<
      IAssetsInfo[],
      IAssetsInfo[]
    >([
      EthereumService.getAssets(appStore.address),
      BSCService.getAssets(appStore.address),
    ])

    // const assetsEth = {}
    // ethereumAssets.forEach((element) => {
    //   const address = element?.address?.pool
    //     ? element.address.pool
    //     : element.address?.vault
    //   const { name, stakedBalance, earnFarm, unstakedBalance, farmToClaim } =
    //     element
    //   if (!element?.address?.pool && !element?.address?.vault) {
    //     debugger
    //   }
    //   assetsEth[address] = {
    //     name,
    //     stakedBalance: stakedBalance?.toString(),
    //     unstakedBalance: unstakedBalance?.toString(),
    //     earnFarm: earnFarm,
    //     farmToClaim: farmToClaim?.toNumber(),
    //   }
    // })
    // console.log({ ethereumAssets }, { BSCAssets }, { assetsEth })

    return [...ethereumAssets, ...BSCAssets]
  }
}

export const assetsStore = new AssetsStore()
